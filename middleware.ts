import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Config ─────────────────────────────────────────────────────────────────────

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// ── Tenant resolution cache ────────────────────────────────────────────────────
// Module-level Map lives for the lifetime of the Edge worker process.
// Intentionally allows stale reads for up to CACHE_TTL_MS to avoid a DB hit
// on every request. Restart the worker (new deploy) to flush immediately.

interface CachedTenant {
  tenantId: string;
  slug: string;
  branding: string; // JSON string
  expiresAt: number;
}

// null means "known miss" (no tenant for this hostname)
const tenantCache = new Map<string, CachedTenant | null>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function resolveTenant(hostname: string): Promise<CachedTenant | null> {
  const now = Date.now();
  if (tenantCache.has(hostname)) {
    const cached = tenantCache.get(hostname)!;
    if (cached === null || cached.expiresAt > now) return cached;
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;

  const headers = {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  };

  type TenantRow = { id: string; slug: string; branding: unknown };

  // 1. Match by custom_domain
  let tenant: TenantRow | null = null;
  try {
    const cdRes = await fetch(
      `${SUPABASE_URL}/rest/v1/tenants?custom_domain=eq.${encodeURIComponent(hostname)}&status=eq.active&select=id,slug,branding&limit=1`,
      { headers, next: { revalidate: 0 } }
    );
    const rows = (await cdRes.json()) as TenantRow[];
    tenant = rows?.[0] ?? null;
  } catch {
    // Network failure — fail open (no tenant) rather than crashing all requests
    return null;
  }

  // 2. Fall back to subdomain matching against root domain
  if (!tenant) {
    const rootHost = ROOT_DOMAIN.split(":")[0];
    const isSubdomain = hostname !== rootHost && hostname.endsWith(`.${rootHost}`);
    if (isSubdomain) {
      const slug = hostname.slice(0, -(`.${rootHost}`.length));
      try {
        const slugRes = await fetch(
          `${SUPABASE_URL}/rest/v1/tenants?slug=eq.${encodeURIComponent(slug)}&status=eq.active&select=id,slug,branding&limit=1`,
          { headers, next: { revalidate: 0 } }
        );
        const rows = (await slugRes.json()) as TenantRow[];
        tenant = rows?.[0] ?? null;
      } catch {
        return null;
      }
    }
  }

  const entry: CachedTenant | null = tenant
    ? {
        tenantId: tenant.id,
        slug: tenant.slug,
        branding: JSON.stringify(tenant.branding),
        expiresAt: now + CACHE_TTL_MS,
      }
    : null;

  tenantCache.set(hostname, entry);
  return entry;
}

// ── Route matchers ─────────────────────────────────────────────────────────────

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/accept-invite(.*)",
  "/api/webhooks(.*)",
  "/api/accept-invite(.*)",
]);


const isSuperAdminRoute = createRouteMatcher(["/super-admin(.*)"]);

// ── Middleware ─────────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const hostname = req.headers.get("host") ?? "";
  const rootHost = ROOT_DOMAIN.split(":")[0];
  const isRootDomain =
    hostname === ROOT_DOMAIN ||
    hostname === rootHost ||
    hostname.startsWith("localhost");

  // Super-admin routes are only reachable on the root domain
  if (isSuperAdminRoute(req) && !isRootDomain) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Inject tenant context for non-root domains
  const tenantHeaders: Record<string, string> = {};

  if (!isRootDomain && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    const entry = await resolveTenant(hostname);

    if (!entry) {
      // Unknown domain — branded 404
      return new NextResponse(
        `<!doctype html><html><head><title>Not Found</title></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center"><h1 style="font-size:3rem;font-weight:bold;margin-bottom:.5rem">404</h1><p style="color:#6b7280">This domain is not configured.</p></div></body></html>`,
        { status: 404, headers: { "Content-Type": "text/html" } }
      );
    }

    tenantHeaders["x-tenant-id"] = entry.tenantId;
    tenantHeaders["x-tenant-slug"] = entry.slug;
    // Keep branding header under 4 KB to stay within typical header limits
    if (entry.branding.length < 4096) {
      tenantHeaders["x-tenant-branding"] = entry.branding;
    }
  }

  // Clerk auth protection
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Forward request with injected tenant headers
  const requestHeaders = new Headers(req.headers);
  for (const [k, v] of Object.entries(tenantHeaders)) {
    requestHeaders.set(k, v);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};

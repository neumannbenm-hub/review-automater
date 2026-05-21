const BASE = process.env.REVIEWBOOST_API_URL ?? "http://localhost:3001";
const SECRET = process.env.REVIEWBOOST_API_SECRET ?? "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SECRET}`,
      ...(options.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Types ────────────────────────────────────────────────────────────────

export type Platform = "google" | "yelp" | "facebook" | "tripadvisor" | "custom";
export type Method = "sms" | "email" | "qr";

export interface ReviewLink {
  code: string;
  destination: string;
  platform: Platform;
  businessId: string | null;
  customerId: string | null;
  createdAt: string;
  clicks: number;
}

export interface CampaignStep {
  stepNumber: number;
  method: Method;
  delayDays: number;
  delayFrom: "visit" | "previous_step";
  template: string | null;
  subject: string | null;
}

export interface Campaign {
  id: string;
  businessId: string;
  name: string;
  steps: CampaignStep[];
  createdAt: string;
  updatedAt?: string;
}

export interface EnrollmentStep {
  stepNumber: number;
  method: Method;
  scheduledAt: string;
  sentAt: string | null;
  status: "pending" | "sent" | "skipped" | "failed";
  sid: string | null;
  messageId: string | null;
  errorMessage: string | null;
}

export interface Enrollment {
  id: string;
  campaignId: string;
  businessId: string;
  customerId: string | null;
  contact: { name: string; phone?: string; email?: string };
  platform: Platform;
  destinationUrl: string;
  visitDate: string;
  status: "active" | "completed" | "stopped" | "unsubscribed";
  converted: boolean;
  steps: EnrollmentStep[];
  createdAt: string;
}

// ── Review Requests ──────────────────────────────────────────────────────

interface SendSmsPayload {
  method: "sms";
  name: string;
  phone: string;
  business: string;
  platform: Platform;
  destinationUrl: string;
  businessId?: string;
  smsTemplate?: string;
}

interface SendEmailPayload {
  method: "email";
  name: string;
  email: string;
  business: string;
  platform: Platform;
  destinationUrl: string;
  businessId?: string;
  emailSubject?: string;
  accentColor?: string;
}

interface SendQrPayload {
  method: "qr";
  name: string;
  business: string;
  platform: Platform;
  destinationUrl: string;
  businessId?: string;
}

export type SendRequestPayload = SendSmsPayload | SendEmailPayload | SendQrPayload;

export interface SendRequestResponse {
  success: boolean;
  method: Method;
  shortUrl: string;
  sid?: string;
  messageId?: string;
  qrImageUrl?: string;
}

export function sendRequest(data: SendRequestPayload) {
  return request<SendRequestResponse>("/api/requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function listLinks(businessId: string) {
  return request<{ links: ReviewLink[]; total: number }>(
    `/api/requests?businessId=${encodeURIComponent(businessId)}`
  );
}

// ── Campaigns ────────────────────────────────────────────────────────────

export function listCampaigns(businessId: string) {
  return request<Campaign[]>(`/api/campaigns?businessId=${encodeURIComponent(businessId)}`);
}

export function getCampaign(id: string) {
  return request<Campaign>(`/api/campaigns/${id}`);
}

export function createCampaign(data: {
  businessId: string;
  name: string;
  steps: Omit<CampaignStep, "stepNumber">[];
}) {
  return request<Campaign>("/api/campaigns", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteCampaign(id: string) {
  return request<{ success: boolean }>(`/api/campaigns/${id}`, { method: "DELETE" });
}

export function getDefaultCampaign() {
  return request<Omit<Campaign, "id" | "businessId" | "createdAt">>("/api/campaigns/default");
}

// ── Enrollments ──────────────────────────────────────────────────────────

export function listEnrollments(businessId: string, status?: string) {
  const params = new URLSearchParams({ businessId });
  if (status) params.set("status", status);
  return request<{ enrollments: Enrollment[]; total: number }>(
    `/api/enrollments?${params}`
  );
}

export function enrollCustomer(data: {
  campaignId: string;
  businessId: string;
  customerId?: string;
  contact: { name: string; phone?: string; email?: string };
  platform: Platform;
  destinationUrl: string;
  visitDate?: string;
}) {
  return request<Enrollment>("/api/enrollments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function stopEnrollment(id: string) {
  return request<{ success: boolean; enrollment: Enrollment }>(
    `/api/enrollments/${id}/stop`,
    { method: "POST" }
  );
}

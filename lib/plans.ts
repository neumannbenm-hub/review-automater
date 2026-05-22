export interface Plan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  requestsPerMonth: number;
  campaigns: number; // -1 = unlimited
  features: string[];
  pricePerExtraRequest: number; // in dollars
}

// Extra requests are purchased in packs; unit price = EXTRA_REQUESTS_PACK_PRICE / EXTRA_REQUESTS_PACK_SIZE
export const EXTRA_REQUESTS_PACK_SIZE = 100;
export const EXTRA_REQUESTS_PACK_PRICE = 10; // $10 for 100 requests = $0.10 each
export const FREE_TRIAL_REQUESTS = 50;

export const PLANS: Plan[] = [
  {
    id: "standard",
    name: "Standard",
    price: 49,
    priceId: process.env.STRIPE_STANDARD_PRICE_ID ?? "",
    requestsPerMonth: 500,
    campaigns: -1,
    pricePerExtraRequest: 0.10,
    features: [
      "500 review requests / mo",
      "Unlimited campaigns",
      "SMS + Email + QR",
      "Click tracking & analytics",
      "$0.10 per extra request",
      "Email support",
    ],
  },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return PLANS.find((p) => p.priceId === priceId);
}

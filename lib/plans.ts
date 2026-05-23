export interface Plan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  requestsPerMonth: number;
  campaigns: number; // -1 = unlimited
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "pro",
    name: "Pro",
    price: 39,
    priceId: process.env.STRIPE_PRICE_ID ?? "",
    requestsPerMonth: 2000,
    campaigns: -1,
    features: [
      "2,000 review requests / mo",
      "Unlimited campaigns",
      "SMS + Email + QR",
      "Click tracking & analytics",
      "Priority support",
    ],
  },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return PLANS.find((p) => p.priceId === priceId);
}

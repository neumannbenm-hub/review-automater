export interface Plan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  requestsPerMonth: number;
  overagePerSequence: number;
  campaigns: number; // -1 = unlimited
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "standard",
    name: "Standard",
    price: 49,
    priceId: process.env.STRIPE_PLAN_PRICE_ID ?? "",
    requestsPerMonth: 500,
    overagePerSequence: 0.10,
    campaigns: -1,
    features: [
      "500 sequences / mo included",
      "$0.10 per additional sequence",
      "Unlimited campaigns",
      "SMS + Email + QR",
      "Click tracking & analytics",
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

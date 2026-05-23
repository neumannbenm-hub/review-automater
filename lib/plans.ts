export interface Plan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  requestsPerMonth: number;
  campaigns: number; // -1 = unlimited
  features: string[];
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  metadataKey: string;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "",
    requestsPerMonth: 500,
    campaigns: 3,
    features: [
      "500 review requests / mo",
      "3 campaigns",
      "SMS + Email + QR",
      "Click tracking",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
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

export const ADD_ONS: AddOn[] = [
  {
    id: "letter",
    name: "Letter",
    description: "Send a physical letter as a campaign step.",
    price: 3.00,
    priceId: process.env.STRIPE_LETTER_ADDON_PRICE_ID ?? "",
    metadataKey: "letterAddon",
  },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return PLANS.find((p) => p.priceId === priceId);
}

export function getAddOnByPriceId(priceId: string): AddOn | undefined {
  return ADD_ONS.find((a) => a.priceId === priceId);
}

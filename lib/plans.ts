export interface Plan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  sequencesPerMonth: number;
  features: string[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  priceId: string;
  quantity: number;
  unit: string;
  rollover: boolean;
  autoRepurchase: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "pro",
    name: "Pro",
    price: 39,
    priceId: process.env.STRIPE_PRICE_ID ?? "",
    sequencesPerMonth: 400,
    features: [
      "400 sequences / mo",
      "Each sequence = one step in a review request campaign",
      "SMS + Email + QR",
      "Click tracking & analytics",
      "Unused sequences roll over",
      "Priority support",
    ],
  },
];

export const ADD_ONS: AddOn[] = [
  {
    id: "sequences-extra",
    name: "Extra Sequences",
    price: 25,
    priceId: process.env.STRIPE_ADDON_SEQUENCES_PRICE_ID ?? "",
    quantity: 250,
    unit: "sequences",
    rollover: true,
    autoRepurchase: true,
  },
  {
    id: "voicemail-drops",
    name: "Voicemail Drops",
    price: 10,
    priceId: process.env.STRIPE_ADDON_VOICEMAIL_PRICE_ID ?? "",
    quantity: 50,
    unit: "voicemail drops",
    rollover: true,
    autoRepurchase: true,
  },
  {
    id: "mailing-letters",
    name: "Mailing Letters",
    price: 150,
    priceId: process.env.STRIPE_ADDON_LETTERS_PRICE_ID ?? "",
    quantity: 50,
    unit: "letters",
    rollover: true,
    autoRepurchase: true,
  },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return PLANS.find((p) => p.priceId === priceId);
}

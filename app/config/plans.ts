export interface Plan {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  items: string[];
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyTotal: string;
}

export const plans: Plan[] = [
  {
    id: "starter",
    title: "Starter",
    subtitle: "Up to 10 000 monthly timer views",
    items: [
      "Everything in Free",
      "Unlimited landing page timers",
      "Scheduled timer",
      "Recurring timer",
    ],
    monthlyPrice: "$6.99",
    yearlyPrice: "$5.59",
    yearlyTotal: "$67.08",
  },
  {
    id: "essential",
    title: "Essential",
    subtitle: "Up to 50 000 monthly timer views",
    badge: "Popular",
    items: [
      "Everything in Starter",
      "Unlimited cart page timers",
      "Unlimited email timers",
      "Adding timer using product tags",
      "Geolocation targeting",
      "Translations",
    ],
    monthlyPrice: "$9.99",
    yearlyPrice: "$7.99",
    yearlyTotal: "$95.88",
  },
  {
    id: "professional",
    title: "Professional",
    subtitle: "Unlimited timer views",
    items: [
      "All premium features",
      "Unlimited product timers",
      "Unlimited top bar timers",
      "Unlimited landing page timers",
      "Unlimited cart page timers",
      "Unlimited email timers",
    ],
    monthlyPrice: "$29.99",
    yearlyPrice: "$23.99",
    yearlyTotal: "$287.88",
  },
];

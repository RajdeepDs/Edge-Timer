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
    monthlyPrice: "$4.99",
    yearlyPrice: "$3.99",
    yearlyTotal: "$47.88",
  },
  {
    id: "standard",
    title: "Standard",
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
    monthlyPrice: "$7.99",
    yearlyPrice: "$6.39",
    yearlyTotal: "$76.68",
  },
  {
    id: "premium",
    title: "Premium",
    subtitle: "Unlimited timer views",
    items: [
      "All premium features",
      "Unlimited product timers",
      "Unlimited top bar timers",
      "Unlimited landing page timers",
      "Unlimited cart page timers",
      "Unlimited email timers",
    ],
    monthlyPrice: "$14.99",
    yearlyPrice: "$11.99",
    yearlyTotal: "$143.88",
  },
];

// The six modules; two pages name them. `available` is data, not a label.
export interface EcosystemModule {
  slug: string;
  name: string;
  role: string;
  description: string;
  img: string;
  available: boolean;
}

export const modules: EcosystemModule[] = [
  {
    slug: "gridflow",
    name: "GridFlow",
    role: "The Brain",
    description: "Orchestrates energy dispatch, load balancing and optimisation.",
    img: "/images/article-1.webp",
    available: false,
  },
  {
    slug: "gridmeter",
    name: "GridMeter",
    role: "The Eyes",
    description:
      "Real-time, tamper-resistant smart metering with billing and wallets.",
    img: "/images/article-2.webp",
    available: true,
  },
  {
    slug: "gridedge",
    name: "GridEdge",
    role: "The Nervous System",
    description: "The local edge controller for sensors and devices.",
    img: "/images/article-3.webp",
    available: false,
  },
  {
    slug: "gridlend",
    name: "GridLend",
    role: "The Wallet",
    description: "Embedded finance for appliances and developers.",
    img: "/images/article-4.webp",
    available: false,
  },
  {
    slug: "gridstore",
    name: "GridStore",
    role: "The Marketplace",
    description: "A curated hub for certified devices and appliances.",
    img: "/images/article-5.webp",
    available: false,
  },
  {
    slug: "gridacademy",
    name: "GridAcademy",
    role: "The Teacher",
    // Written as an apostrophe, not as `&apos;`. This is a string rendered
    // through {description}, where an HTML entity appears verbatim on the page.
    description: "Building Africa’s next generation of energy innovators.",
    img: "/images/article-6.webp",
    available: true,
  },
];

export const liveModules = modules.filter((m) => m.available);

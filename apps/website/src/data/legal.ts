/**
 * Copy for the Privacy Policy and Terms & Conditions pages.
 *
 * These lived inline in the Next page files. They are data, not markup, so they
 * sit here and the `.astro` pages stay to a few lines.
 */

export const privacyPolicySections = [
  {
    number: 1,
    title: "Information We Collect",
    subsections: [
      {
        subtitle: "a. Personal Information",
        items: [
          "Full name",
          "Email address",
          "Phone number",
          "Business name and address",
          "Bank and settlement details (for merchants)",
          "Identification and compliance information (where required)",
        ],
      },
      {
        subtitle: "b. Transactional Information",
        items: [
          "Payment records",
          "Meter numbers",
          "Token vending history",
          "Transaction references and timestamps",
        ],
      },
      {
        subtitle: "c. Technical Information",
        items: [
          "IP address",
          "Browser type",
          "Device information",
          "Log data and usage statistics",
        ],
      },
    ],
  },
  {
    number: 2,
    title: "How We Use Your Information",
    content: "We use collected information to:",
    items: [
      "Provide and operate our services",
      "Process payments and facilitate utility tokens",
      "Authenticate users and merchants",
      "Improve platform performance and security",
      "Comply with legal and regulatory obligations",
      "Communicate service updates and support responses",
    ],
  },
  {
    number: 3,
    title: "Data Sharing and Disclosure",
    content:
      "Gridcore does not sell personal data. We may share information only:",
    items: [
      "With licensed partners and service providers necessary to deliver services",
      "When required by law, regulation, or court order",
      "To protect Gridcore's rights, users, and platform integrity",
    ],
    footer: "All third parties are required to maintain strict confidentiality.",
  },
  {
    number: 4,
    title: "Data Security",
    content: "We implement industry standard security measures, including:",
    items: [
      "Encryption of sensitive data",
      "Secure storage systems",
      "Controlled access protocols",
      "Regular security reviews",
    ],
    footer:
      "Despite our efforts, no system is 100% secure. Users are encouraged to protect their credentials.",
  },
  {
    number: 5,
    title: "Data Retention",
    content:
      "We retain personal and transactional data only for as long as necessary to:",
    items: [
      "Fulfill service obligations",
      "Meet regulatory and compliance requirements",
      "Resolve disputes and enforce agreements",
    ],
  },
  {
    number: 6,
    title: "Your Rights",
    content: "Subject to applicable laws, you have the right to:",
    items: [
      "Request access to your personal data",
      "Request correction or deletion of data",
      "Withdraw consent where applicable",
    ],
    footer: "Requests can be made via official Gridcore support channels.",
  },
  {
    number: 7,
    title: "Cookies",
    content:
      "Gridcore may use cookies and similar technologies to enhance user experience, analyze traffic, and improve functionality. You may disable cookies through your browser settings.",
  },
  {
    number: 8,
    title: "Changes to This Privacy Policy",
    content:
      "Gridcore reserves the right to update this Privacy Policy at any time. Updates will be posted on our website with a revised effective date.",
  },
  {
    number: 9,
    title: "Contact Us",
    content: "For privacy related questions, contact:",
    contact: {
      company: "Gridcore Inc.",
      email: "support@gridcore.com",
      address: "41 Addo Langbasa Road, Ajah, Lagos, Nigeria",
    },
  },
];

export const termsSections = [
  {
    number: 1,
    title: "Definitions",
    definitions: [
      { term: "Gridcore:", description: "Gridcore Inc" },
      {
        term: "User:",
        description: "Any individual or entity using the platform",
      },
      {
        term: "Merchant:",
        description: "A registered business using Gridcore to vend utilities",
      },
      {
        term: "Services:",
        description: "All products, APIs, and platforms provided by Gridcore",
      },
    ],
  },
  {
    number: 2,
    title: "Eligibility",
    content:
      "You must be legally capable of entering a binding agreement to use Gridcore services. Merchants must complete onboarding and verification.",
  },
  {
    number: 3,
    title: "Use of Services",
    content: "Users agree to:",
    items: [
      "Use the platform only for lawful purposes",
      "Provide accurate and complete information",
      "Not attempt unauthorized access or system interference",
      "Comply with all applicable regulations",
    ],
  },
  {
    number: 4,
    title: "Transactions and Payments",
    items: [
      "Gridcore facilitates payment collection and utility vending",
      "Transaction success depends on meter validity and third-party systems",
      "Commission and settlement terms are governed by merchant agreements",
      "Gridcore is not responsible for failures caused by external providers",
    ],
  },
  {
    number: 5,
    title: "Intellectual Property",
    content:
      "All content, software, trademarks, and documentation belong to Gridcore Inc. Unauthorized reproduction or distribution is prohibited.",
  },
  {
    number: 6,
    title: "Service Availability",
    content:
      "Gridcore aims for high system uptime but does not guarantee uninterrupted service. Maintenance and unforeseen outages may occur.",
  },
  {
    number: 7,
    title: "Limitation of Liability",
    content: "To the maximum extent permitted by law:",
    subContent:
      "Gridcore shall not be liable for indirect, incidental, or consequential damages. Liability is limited to the value of the affected transaction.",
  },
  {
    number: 8,
    title: "Termination",
    content: "Gridcore may suspend or terminate access if:",
    items: [
      "These Terms are breached",
      "Fraudulent or illegal activity is detected",
      "Required by law or regulation",
    ],
    footer:
      "Merchants may terminate services according to their SLA or contract terms.",
  },
  {
    number: 9,
    title: "Governing Law",
    content:
      "These Terms are governed by the laws of the Federal Republic of Nigeria.",
  },
  {
    number: 10,
    title: "Amendments",
    content:
      "Gridcore reserves the right to amend these Terms at any time. Continued use of the services constitutes acceptance of updated Terms.",
  },
  {
    number: 11,
    title: "Contact Information",
    content: "For questions regarding these Terms, contact:",
    contact: {
      company: "Gridcore Inc",
      email: "support@gridcore.com",
      address: "41 Addo Langbasa Road, Ajah, Lagos, Nigeria",
    },
  },
];

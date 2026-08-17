const columns = [
  {
    title: "Company",
    links: [
      { text: "About us", href: "/about-us" },
      { text: "Solutions", href: "/solutions" },
      { text: "Merchants", href: "/merchants" },
      { text: "Contact us", href: "/contact-us" },
    ],
  },
  {
    title: "Legal",
    links: [
      { text: "Privacy Policy", href: "/privacy-policy" },
      { text: "Terms of Use", href: "/terms-and-conditions" },
    ],
  },
  {
    title: "Get in touch",
    links: [
      { text: "info@gridcoreinc.com", href: "mailto:info@gridcoreinc.com" },
      { text: "+234 802 776 2570", href: "tel:+2348027762570" },
    ],
  },
];

// `logo.png` is the white wordmark; `logo-white.png` is the black one.
const TopFooter = () => {
  return (
    <div className="container pb-14 pt-16 sm:pt-20">
      <div className="flex flex-wrap gap-10 lg:flex-nowrap lg:gap-8">
        <div className="basis-full lg:basis-5/12">
          <img
            src="/images/logo.png"
            alt="GridCore"
            width={150}
            height={28}
            className="h-auto w-37.5"
          />
          <p className="mt-5 max-w-100 text-white/70">
            Building the next generation of decentralised energy infrastructure
            across Africa.
          </p>
        </div>

        <div className="basis-full lg:basis-7/12">
          <div className="flex flex-wrap justify-between gap-10 sm:flex-nowrap lg:gap-8">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-secondary">
                  {column.title}
                </h2>
                <ul className="mt-4 flex list-none flex-col gap-3 p-0">
                  {column.links.map((link) => (
                    <li key={link.text}>
                      <a
                        href={link.href}
                        className="text-white/70 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopFooter;

interface ContactInfo {
  company: string;
  email: string;
  address: string;
}

interface Subsection {
  subtitle: string;
  items: string[];
}

interface Section {
  number: number;
  title: string;
  content?: string;
  definitions?: { term: string; description: string }[];
  subsections?: Subsection[];
  items?: string[];
  contact?: ContactInfo;
}

interface PPAndTACContentsProps {
  intro: string;
  sections: Section[];
}

// `intro` is a prop: it was hardcoded, so Terms opened with the Privacy lede.
const PPAndTACContents = ({ intro, sections }: PPAndTACContentsProps) => {
  return (
    <div className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="leading-relaxed text-primary/75">{intro}</p>

        {sections.map((section) => (
          <section key={section.number} className="mt-12">
            <h2 className="mb-4 text-2xl font-semibold text-primary">
              {section.number}. {section.title}
            </h2>

            {section.content && (
              <p className="mb-4 text-primary/75">{section.content}</p>
            )}

            {section.definitions && (
              <div className="flex flex-col gap-2">
                {section.definitions.map((def) => (
                  <p key={def.term} className="text-primary/75">
                    <span className="font-semibold text-primary">
                      {def.term}
                    </span>{" "}
                    {def.description}
                  </p>
                ))}
              </div>
            )}

            {section.subsections ? (
              <div className="flex flex-col gap-6">
                {section.subsections.map((sub) => (
                  <div key={sub.subtitle}>
                    <h3 className="mb-3 font-semibold text-primary">
                      {sub.subtitle}
                    </h3>
                    <ul className="flex list-none flex-col gap-2 p-0">
                      {sub.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-primary/75"
                        >
                          <span
                            aria-hidden
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : section.items ? (
              <ul className="flex list-none flex-col gap-2 p-0">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-primary/75"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {section.contact && (
              <div className="mt-4 rounded-xl border border-border bg-card p-5">
                <p className="font-medium text-primary">
                  {section.contact.company}
                </p>
                <p className="mt-2 text-primary/75">
                  <span className="font-semibold text-primary">Email:</span>{" "}
                  <a
                    href={`mailto:${section.contact.email}`}
                    className="underline underline-offset-4"
                  >
                    {section.contact.email}
                  </a>
                </p>
                <p className="mt-1 text-primary/75">
                  <span className="font-semibold text-primary">Address:</span>{" "}
                  {section.contact.address}
                </p>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default PPAndTACContents;

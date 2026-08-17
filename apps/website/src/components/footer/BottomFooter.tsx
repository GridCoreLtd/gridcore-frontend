// Brand marks stay hand-drawn — lucide v1 dropped them — but take currentColor.
const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/gridcoreinc?igsh=dWR5ZHc2Z3ZlMmI1",
    path: (
      <>
        <path
          d="M0.75 10.25C0.75 5.772 0.75 3.532 2.141 2.141C3.532 0.75 5.771 0.75 10.25 0.75C14.728 0.75 16.968 0.75 18.359 2.141C19.75 3.532 19.75 5.771 19.75 10.25C19.75 14.728 19.75 16.968 18.359 18.359C16.968 19.75 14.729 19.75 10.25 19.75C5.772 19.75 3.532 19.75 2.141 18.359C0.75 16.968 0.75 14.729 0.75 10.25Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.758 4.75H15.748M14.75 10.25C14.75 11.4435 14.2759 12.5881 13.432 13.432C12.5881 14.2759 11.4435 14.75 10.25 14.75C9.05653 14.75 7.91193 14.2759 7.06802 13.432C6.22411 12.5881 5.75 11.4435 5.75 10.25C5.75 9.05653 6.22411 7.91193 7.06802 7.06802C7.91193 6.22411 9.05653 5.75 10.25 5.75C11.4435 5.75 12.5881 6.22411 13.432 7.06802C14.2759 7.91193 14.75 9.05653 14.75 10.25Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/gridcoreinc/",
    path: (
      <>
        <path
          d="M4.75 14.75V7.75M18.75 5.75V13.75C18.75 15.0761 18.2232 16.3479 17.2855 17.2855C16.3479 18.2232 15.0761 18.75 13.75 18.75H5.75C4.42392 18.75 3.15215 18.2232 2.21447 17.2855C1.27678 16.3479 0.75 15.0761 0.75 13.75V5.75C0.75 4.42392 1.27678 3.15215 2.21447 2.21447C3.15215 1.27678 4.42392 0.75 5.75 0.75H13.75C15.0761 0.75 16.3479 1.27678 17.2855 2.21447C18.2232 3.15215 18.75 4.42392 18.75 5.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.75 14.749V11.499M8.75 11.499V7.74905M8.75 11.499C8.75 7.74905 14.75 7.74905 14.75 11.499V14.749M4.75 4.75905L4.76 4.74805"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
];

const BottomFooter = () => {
  return (
    <div className="container py-6">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-5">
          {socials.map(({ name, href, path }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GridCore on ${name} (opens in a new tab)`}
              className="rounded-md p-1 text-white/60 transition hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                {path}
              </svg>
            </a>
          ))}
        </div>

        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} GridCore. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default BottomFooter;

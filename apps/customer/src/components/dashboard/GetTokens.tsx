import { Link } from "react-router-dom";

export default function GetTokens() {
  return (
    <section className="w-full h-full bg-blue-100 flex flex-wrap sm:flex-nowrap gap-12 sm:gap-6 p-8 sm:p-6 rounded-md">
      <div className="basis-full sm:basis-7/12 order-2 sm:order-1">
        <h2 className="text-2xl font-medium mb-2">Get Tokens</h2>

        <div className="text-accent sm:text-lg mb-9">
          Get tokens for your meters in one step
        </div>

        <Link
          to="/topup"
          className="rounded-md bg-secondary py-4 px-16 text-sm font-semibold text-black shadow-xs"
        >
          Top Up Now
        </Link>
      </div>

      <div className="basis-full sm:basis-5/12 order-1 sm:order-2">
        <img
          src="/images/dashboard-illustration.svg"
          alt="Dashboard illustration"
          className="w-full h-auto sm:w-auto sm:h-40"
        />
      </div>
    </section>
  );
}

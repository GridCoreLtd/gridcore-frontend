import { useEffect, useState } from "react";
import { formatCurrency } from "@gridcore/ui/lib/format";
import { useAtomValue } from "jotai";
import { userAtom } from "@gridcore/api-client";
import { useUserProfile } from "@/hooks/useUserProfile";
import FundWallet from "./FundWallet";

export default function MyWallet() {
  const { userProfile, refetchProfile } = useUserProfile();

  useEffect(() => {
    refetchProfile();
  }, []);

  const user: any = useAtomValue(userAtom);

  return (
    <section className="w-full h-full bg-gray-100 ring-1 shadow-xs ring-gray-300 flex flex-wrap sm:flex-nowrap gap-12 sm:gap-6 p-8 sm:p-6 rounded-md">
      <div className="basis-full sm:basis-7/12 order-2 sm:order-1">
        <h2 className="text-2xl font-medium mb-4">My Wallet</h2>

        <div className="mb-4">
          <div className="text-accent text-sm mb-1">Current Balance</div>

          <div className="text-4xl font-bold gradient-text">
            {formatCurrency({ currency: user?.associatedMerchant?.currency?.code, amount: user?.wallet?.balance || 0, country: user?.associatedMerchant?.country?.code })}
          </div>
        </div>

        <FundWallet country={user?.associatedMerchant?.country?.code} />
      </div>

      <div className="basis-full sm:basis-5/12 order-1 sm:order-2">
        <img
          src="/images/wallet-illustration.svg"
          alt="Dashboard illustration"
          className="w-full h-auto sm:w-auto sm:h-40"
        />
      </div>
    </section>
  );
}

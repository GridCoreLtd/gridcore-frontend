
import { useUserProfile } from "@/hooks/useUserProfile";
import { userAtom } from "@gridcore/api-client";
import { formatCurrency } from "@gridcore/ui/lib/format";
import { useAtomValue } from "jotai";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";

export default function DashboardWallet() {
  const { userProfile, refetchProfile } = useUserProfile();

  useEffect(() => {
    refetchProfile();
  }, []);

  const user: any = useAtomValue(userAtom);

  return (
    <section className="w-full h-full p-8 sm:p-6 rounded-md ring-1 shadow-xs ring-gray-300">
      <h2 className="text-2xl font-medium mb-4">My Wallet Balance</h2>

      <div className="text-5xl font-bold gradient-text">
        <span>
          {formatCurrency({ currency: user?.associatedMerchant?.currency?.code, amount: user?.wallet?.balance || 0, country: user?.associatedMerchant?.country?.code })}
        </span>
      </div>

      <Link to="/payments" className="inline-flex items-center gap-x-3 mt-8">
        <span className="text-lg gradient-text font-medium">Go to Wallet</span>
        <ArrowRight className="h-5 w-5 text-secondary" aria-hidden="true" />
      </Link>
    </section>
  );
}

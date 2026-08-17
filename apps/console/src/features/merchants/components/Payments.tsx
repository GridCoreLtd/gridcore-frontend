
import React from "react";

import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/utils/axios-instance";
import { formatCurrency } from "@gridcore/ui/lib/format";
import { currencyFormatter } from "@/utils/formatters";

import Commission from "./Commission";
import Payouts from "./Payouts";

const Payments = ({ merchant }: any) => {
  const { data: totalCommission } = useQuery({
    queryKey: ["total-paygodash-commission"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/merchants/${merchant.id}/total-paygodash-commission`,
      );
      return res.data.data;
    },
  });

  return (
    <section className="py-8">
      <div className="flex flex-wrap sm:flex-nowrap gap-4">
        <div className="basis-full sm:basis-5/12 w-full h-auto bg-gray-100 ring-1 shadow-xs ring-gray-300 flex justify-between items-center gap-12 sm:gap-6 p-5 sm:p-6 rounded-md">
          <div>
            <h2 className="text-accent text-sm mb-2">Available Balance</h2>

            <div className="text-4xl font-bold text-primary">
              {formatCurrency({ country: merchant.country, currency: merchant.currency, amount: merchant?.wallet?.balance || 0 })}
            </div>
          </div>

          <div className="hidden sm:block">
            <img
              src="/images/wallet-illustration.svg"
              alt="Dashboard illustration"
              className="w-full h-auto sm:w-auto sm:h-28"
            />
          </div>
        </div>

        <div className="basis-full sm:basis-4/12">
          <Commission merchant={merchant} />
        </div>

        <div className="basis-full sm:basis-3/12 w-full h-auto bg-gray-100 ring-1 shadow-xs ring-gray-300 flex justify-between items-center gap-12 sm:gap-6 p-5 sm:p-6 rounded-md">
          <div>
            <h2 className="text-lg font-medium mb-1">Total Commission</h2>

            <div className="text-accent text-xs mb-4">
              Total commission generated from transactions through this merchant
            </div>

            <div className="text-4xl font-bold text-primary">
              {formatCurrency({ country: merchant.country, currency: merchant.currency, amount: totalCommission?.amount || 0 })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Payouts merchant={merchant} />
      </div>
    </section>
  );
};

export default Payments;

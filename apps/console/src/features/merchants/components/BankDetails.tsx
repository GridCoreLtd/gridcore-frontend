
import { useEffect, useState } from "react";

import { Landmark, Plus, SquarePen } from "lucide-react";

import SlideOver from "@gridcore/ui/components/overlays/SlideOver";

import BankCard from "@/components/BankCard";
import { NewBank } from "@/entities/merchant";

export default function BankDetails({ merchant }: any) {
  const [openSlideOver, setOpenSlideOver] = useState(false);
  const [hasBank, setHasBank] = useState(false);

  useEffect(() => {
    merchant.bankAccountName ? setHasBank(true) : setHasBank(false);
  }, [merchant.bankAccountName]);

  const handleNewBank = () => {
    setOpenSlideOver(true);
  };

  return (
    <section className="py-8">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <h1 className="text-xl font-bold">Bank Account Details</h1>

        {hasBank && (
          <button
            onClick={handleNewBank}
            className="flex justify-center rounded-md gradient-bg py-[0.56rem] px-3 sm:px-6 gap-x-2 text-sm font-medium text-white shadow-xs"
          >
            <SquarePen className="h-4 w-4" />
            <span>Change Bank Account</span>
          </button>
        )}
      </div>

      {!hasBank && (
        <div className="text-center mt-32">
          <Landmark className="h-12 w-12 text-accent mx-auto" />

          <h3 className="mt-2 text-lg font-semibold text-gray-900">
            No Bank Account
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new bank account.
          </p>

          <div className="mt-6">
            <button
              onClick={handleNewBank}
              className="inline-flex justify-center rounded-md gradient-bg py-2 px-3 text-xs font-medium text-white shadow-xs"
            >
              <Plus className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
              Add Bank Account
            </button>
          </div>
        </div>
      )}

      {hasBank && (
        <div className="mt-6">
          <BankCard merchant={merchant} />
        </div>
      )}

      {openSlideOver && (
        <SlideOver
          open={true}
          setOpen={setOpenSlideOver}
          title="Add new bank account"
        >
          <NewBank
            merchantId={merchant.id}
            closeSlideOver={() => setOpenSlideOver(false)}
          />
        </SlideOver>
      )}
    </section>
  );
}

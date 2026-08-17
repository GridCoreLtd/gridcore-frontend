import { Landmark } from "lucide-react";

export default function BankCard({ merchant }: any) {
  return (
    <section>
      <div className="max-w-lg">
        <div className="bg-white ring-1 ring-gray-300 hover:bg-gray-100 rounded-md shadow-xs flex items-center gap-6 p-6">
          <Landmark className="h-16 w-16 sm:h-24 sm:w-24" />

          <div className="text-sm">
            <div>
              <span className="font-medium mr-2">Bank Name:</span>
              <span className="text-gray-500">{merchant.bankName}</span>
            </div>

            <div className="mt-2">
              <span className="font-medium mr-2">Account Number:</span>
              <span className="text-gray-500">
                {merchant.bankAccountNumber}
              </span>
            </div>

            <div className="mt-2">
              <span className="font-medium mr-2">Account Name:</span>
              <span className="text-gray-500">{merchant.bankAccountName}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

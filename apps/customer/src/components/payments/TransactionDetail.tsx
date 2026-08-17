import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { formatCurrency } from "@gridcore/ui/lib/format";
import { dateFormatter } from "@/utils/formatters";
import { useAtomValue } from "jotai";
import { userAtom } from "@gridcore/api-client";

export default function TransactionDetail({
  transaction,
}: {
  transaction: any;
}) {
  const user: any = useAtomValue(userAtom);

  return (
    <section>
      <div className="border-b border-gray-300 pb-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Transaction Ref.</div>
          <div className="font-medium">{transaction.reference}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Amount</div>
          <div className="font-medium">
            {formatCurrency({ currency: user?.associatedMerchant?.currency?.code, amount: transaction.amount, country: user?.associatedMerchant?.country?.code })}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Payment Gateway</div>
          <div className="font-medium">
            {sentenceCaseFormatter(transaction.paymentGateway) || "N/A"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Channel</div>
          <div className="font-medium">
            {sentenceCaseFormatter(transaction.source)}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Destination</div>
          <div className="font-medium">
            {transaction.destination
              ? sentenceCaseFormatter(transaction.destination)
              : "N/A"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Type</div>
          <div className="font-medium">
            {sentenceCaseFormatter(transaction.type)}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Status</div>
          <div className="font-medium">
            {sentenceCaseFormatter(transaction.status)}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Payment Processing Fee</div>
          <div className="font-medium">
            <div className="font-medium">
              {transaction.paymentProcessingFee
                ? formatCurrency({ currency: user?.associatedMerchant?.currency?.code, amount: transaction.paymentProcessingFee, country: user?.associatedMerchant?.country?.code })
                : "N/A"}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Date</div>
          <div className="font-medium">
            {dateFormatter.format(new Date(transaction.createdAt))}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Meter No.</div>
          <div className="font-medium">{transaction.meterNumber || "N/A"}</div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4">
        <div>
          <div className="text-xs text-accent mb-1">Desription</div>
          <div className="font-medium">{transaction.description || "N/A"}</div>
        </div>
      </div>
    </section>
  );
}

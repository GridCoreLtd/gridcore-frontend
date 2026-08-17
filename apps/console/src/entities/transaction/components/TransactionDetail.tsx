import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { currencyFormatter, dateFormatter } from "@/utils/formatters";

export function TransactionDetail({ transaction }: { transaction: any }) {
  return (
    <section>
      <div className="border-b border-gray-300 pb-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Customer&apos;s Name</div>
          <div className="font-medium">
            {`${transaction?.user?.firstName} ${transaction?.user?.lastName}` ||
              "N/A"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Associated Merchant</div>
          <div className="font-medium">
            {transaction?.user?.associatedMerchant?.businessName || "N/A"}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Transaction Ref.</div>
          <div className="font-medium">{transaction.reference}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Amount</div>
          <div className="font-medium">
            {currencyFormatter.format(transaction.amount)}
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
          <div className="text-xs text-accent mb-1">Gateway Response</div>
          <div className="font-medium">
            {sentenceCaseFormatter(transaction.gatewayResponse) || "N/A"}
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


import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { formatCurrency } from "@gridcore/ui/lib/format";
import { dateFormatter } from "@/utils/formatters";
import Receipt from "@/components/dashboard/Receipt";
import { resolveReceiptLogo } from "@gridcore/ui/lib/receipt-logo";
import { pdf } from "@react-pdf/renderer";
import { useState } from "react";
import { toast } from "react-toastify";

export default function TopupDetail({ topup }: { topup: any }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReceipt = async () => {
    try {
      setDownloading(true);
      const logoSrc = await resolveReceiptLogo(
        topup?.user?.associatedMerchant?.businessLogo,
      );
      const blob = await pdf(<Receipt topup={topup} logoSrc={logoSrc} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Transaction-${topup?.token ?? "receipt"}-PayGoDash.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Receipt download failed", error);
      toast.error("Could not generate the receipt. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section>
      <div className="border-b border-gray-300 pb-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Transaction Ref.</div>
          <div className="font-medium">
            {topup?.transaction?.reference || "N/A"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Meter No.</div>
          <div className="font-medium">
            {topup?.meter?.meterNumber || "N/A"}
          </div>
        </div>

        <div>
          <div className="text-xs text-accent mb-1">Meter Type</div>
          <div className="font-medium">{topup?.meter?.meterType || "N/A"}</div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Token</div>
          <div className="font-medium">{topup?.token || "N/A"}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">
            No. of &nbsp;{" "}
            {topup?.meter?.meterType === "TIME"
              ? "Minutes"
              : topup?.meter?.meterType === "WATER"
              ? "kL (kiloliter)"
              : "kwh (kilowatt-hour)"}
          </div>
          <div className="font-medium">{topup?.noOfUnits}</div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Amount</div>
          <div className="font-medium">
            {topup?.transaction?.amount
              ? formatCurrency({ currency: topup?.user?.associatedMerchant?.currency?.code, amount: topup.transaction?.amount, country: topup?.user?.associatedMerchant?.country?.code })
              : "N/A"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Tariff</div>
          <div className="font-medium">
            {topup?.tariffUsed
              ? formatCurrency({ currency: topup?.user?.associatedMerchant?.currency?.code, amount: topup.tariffUsed, country: topup?.user?.associatedMerchant?.country?.code })
              : "N/A"}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Site Debt</div>
          <div className="font-medium">
            {formatCurrency({ currency: topup?.user?.associatedMerchant?.currency?.code, amount: topup?.siteDebtSettled ?? 0, country: topup?.user?.associatedMerchant?.country?.code })}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-accent mb-1">Top Up</div>
          <div className="font-medium">
            {formatCurrency({ currency: topup?.user?.associatedMerchant?.currency?.code, amount: topup?.topupAmount ?? 0, country: topup?.user?.associatedMerchant?.country?.code })}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Payment Method</div>
          <div className="font-medium">
            {topup?.transaction?.source
              ? sentenceCaseFormatter(topup.transaction.source)
              : "N/A"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Payment Processing Fee</div>
          <div className="font-medium">
            <div className="font-medium">
              {topup?.transaction?.paymentProcessingFee
                ? formatCurrency({ currency: topup?.user?.associatedMerchant?.currency?.code, amount: topup.transaction.paymentProcessingFee, country: topup?.user?.associatedMerchant?.country?.code })
                : "N/A"}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Status</div>
          <div className="font-medium">
            {topup?.topupStatus
              ? sentenceCaseFormatter(topup.topupStatus)
              : "N/A"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Date</div>
          <div className="font-medium">
            {topup?.createdAt
              ? dateFormatter.format(new Date(topup.createdAt))
              : "N/A"}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4">
        <div>
          <div className="text-xs text-accent mb-1">Meter Address</div>
          <div className="font-medium">
            {topup?.meter?.meterAddress || "N/A"}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-10">
        <button
          onClick={handleDownloadReceipt}
          disabled={downloading}
          className="flex justify-center rounded-md gradient-bg py-3 px-6 w-full sm:w-auto text-sm font-semibold text-white shadow-xs disabled:opacity-60"
        >
          {downloading ? "Generating receipt..." : "Download Receipt"}
        </button>
      </div>
    </section>
  );
}

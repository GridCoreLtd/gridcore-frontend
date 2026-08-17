import { useEffect, useState } from "react";

import { PDFDownloadLink } from "@react-pdf/renderer";

import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { currencyFormatter, dateFormatter } from "@/utils/formatters";
import { resolveReceiptLogo } from "@gridcore/ui/lib/receipt-logo";

import Receipt from "./Receipt";


export default function TopupDetail({ topup }: { topup: any }) {
  const [logoSrc, setLogoSrc] = useState<string>("/images/logo-yellow.png");

  useEffect(() => {
    resolveReceiptLogo(topup?.user?.associatedMerchant?.businessLogo).then(
      setLogoSrc,
    );
  }, [topup]);

  return (
    <section>
      <div className="border-b border-gray-300 pb-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Customer&apos;s Name</div>
          <div className="font-medium">
            {`${topup?.user?.firstName} ${topup?.user?.lastName}` || "N/A"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Associated Merchant</div>
          <div className="font-medium">
            {topup?.user?.associatedMerchant?.businessName || "N/A"}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
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
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Token</div>
          <div className="font-medium">{topup?.token || "N/A"}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">No. of Units</div>
          <div className="font-medium">{topup?.noOfUnits}</div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Amount</div>
          <div className="font-medium">
            {topup?.transaction?.amount
              ? currencyFormatter.format(topup.transaction?.amount)
              : "N/A"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-accent mb-1">Tarrif</div>
          <div className="font-medium">
            {topup.tariffUsed
              ? currencyFormatter.format(topup.tariffUsed)
              : "N/A"}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4 grid grid-cols-2">
        <div>
          <div className="text-xs text-accent mb-1">Site Debt</div>
          <div className="font-medium">
            {currencyFormatter.format(topup?.siteDebtSettled ?? 0)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-accent mb-1">Top Up</div>
          <div className="font-medium">
            {currencyFormatter.format(topup?.topupAmount ?? 0)}
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
              {topup.transaction.paymentProcessingFee
                ? currencyFormatter.format(
                    topup.transaction.paymentProcessingFee
                  )
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
            {dateFormatter.format(new Date(topup.createdAt))}
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

      <div className="border-b border-gray-300 py-4">
        <div>
          <div className="text-xs text-accent mb-1">Provider Response</div>
          <div className="font-medium">
            {topup?.topupStatus == "FAILED"
              ? topup?.providerResponse?.message
              : "Token generated successfully"}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 py-4">
        <div>
          <div className="text-xs text-accent mb-1">Description</div>
          <div className="font-medium">{topup?.description}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-10">
        <PDFDownloadLink
          document={<Receipt topup={topup} logoSrc={logoSrc} />}
          fileName={`Transaction-${topup?.token}-PayGoDash.pdf`}
        >
          {/* PDFDownloadLink is typed as taking an element, but also accepts a render function. */}
          {/* @ts-expect-error -- see above; upstream typing is narrower than the runtime API. */}
          {({ blob, url, loading, error }: any) => (
            <button className="flex justify-center rounded-md gradient-bg py-3 px-6 w-full sm:w-auto text-sm font-semibold text-white shadow-xs">
              {loading ? "Loading receipt..." : "Download Receipt"}
            </button>
          )}
        </PDFDownloadLink>
      </div>
    </section>
  );
}

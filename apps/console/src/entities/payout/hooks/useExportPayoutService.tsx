import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

import type { Payout } from "../types";
import { parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";
import { exportCSVFn } from "@/utils/csv-export";
import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { currencyFormatter } from "@/utils/formatters";

interface UsePaymentServiceParams {
    merchantId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}

export default function usePaymentService() {

    const exportHeaders = [
        { label: "Reference", key: "reference" as keyof Payout },
        {
          label: "Merchant",
          key: "merchantName" as keyof Payout,
          formatter: (row: Payout) =>
            row.merchantName ?? row.merchant?.businessName ?? "—",
        },
        { label: "Bank Name", key: "bankName" as keyof Payout },
        { label: "Account Number", key: "bankAccountNumber" as keyof Payout },
        {
          label: "Amount",
          key: "amount" as keyof Payout,
          formatter: (row: Payout) => currencyFormatter.format(row.amount),
        },
        {
          label: "Status",
          key: "status" as keyof Payout,
          formatter: (row: Payout) => sentenceCaseFormatter(row.status),
        },
        {
          label: "Date",
          key: "createdAt" as keyof Payout,
          formatter: (row: Payout) =>
            format(new Date(row.createdAt), "yyyy-MM-dd HH:mm:ss"),
        },
      ];

    const exportFunc = useMutation({
        mutationFn: async ({ merchantId, status, startDate, endDate }: UsePaymentServiceParams) => {
            const params = new URLSearchParams({
                page: String(1),
                perPage: String(10000),
                ...(merchantId && { merchantId }),
                ...(status && { status }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
            });

            const res = await axiosInstance.get(
                `/payments/get-payouts?${params.toString()}`
            );
            const payload = res.data?.data ?? res.data;
            const list = (Array.isArray(payload?.data) ? payload.data : payload ?? []) as Payout[];
            return list;
        },
        onError(err:any) {
      toast.error(toastMessage(parseApiError(err)));
    },
        async onSuccess(data) {
            await exportCSVFn(
                data,
                exportHeaders,
                "merchant-payouts.csv"
            );
            toast.success("Export completed");
        }
    })

    return {
        exportFn: exportFunc,
    };

}
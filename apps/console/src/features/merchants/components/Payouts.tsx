
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import ButtonExport from "@/components/shared/Button/ButtonExport";
import type { TableColumn } from "@/components/shared/Table";
import Table from "@/components/shared/Table";
import { useExportPayoutService } from "@/entities/payout";
import axiosInstance from "@/utils/axios-instance";
import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { currencyFormatter, dateFormatter } from "@/utils/formatters";

import RetryPayoutButton from "./RetryPayoutButton";

const Payouts = ({ merchant }: any) => {
  const {exportFn} = useExportPayoutService();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const { data: payouts, isFetching } = useQuery({
    queryKey: ["payouts", currentPage],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/payments/get-merchant-payouts?page=${currentPage}&perPage=10&merchantId=${merchant.id}`,
      );
      return res.data.data;
    },
    onSuccess(data) {
      setTotalPages(data.meta.lastPage);
    },
    keepPreviousData: true,
  });

  const columns: TableColumn[] = [
    { label: "Reference", key: "reference", emphasized: true },
    {
      label: "Bank Name",
      key: "bankName",
    },
    {
      label: "Account Number",
      key: "bankAccountNumber",
    },
    {
      label: "Account Name",
      key: "bankAccountName",
    },
    {
      label: "Amount",
      key: "amount",
      formatter: (value: number) => currencyFormatter.format(value),
    },
    {
      label: "Status",
      key: "status",
      formatter: (value: string) => sentenceCaseFormatter(value),
    },
    {
      label: "Date",
      key: "createdAt",
      formatter: (value: any) => dateFormatter.format(new Date(value)),
    },
  ];

  return (
    <section>
      <h1 className="text-xl font-bold mb-4">Payouts</h1>

      <div className="w-[105px] pr-8 ml-[89.5%]">
        <ButtonExport 
          disabled={false}
          topup={false}
          handleDownload={() => exportFn.mutate({ merchantId: merchant.id })}>
          {exportFn.isLoading ? "Exporting..." : "Export"}
        </ButtonExport>
      </div>

      <Table
        columns={columns}
        data={payouts?.data}
        loading={isFetching}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={(page: number) => setCurrentPage(page)}
        actions={(row) => (
          <RetryPayoutButton
            payoutId={row.id}
            status={row.status}
            currentPage={currentPage}
          />
        )}
      />
    </section>
  );
};

export default Payouts;

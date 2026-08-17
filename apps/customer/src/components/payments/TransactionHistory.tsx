
import axiosInstance from "@/utils/axios-instance";
import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { formatCurrency } from "@gridcore/ui/lib/format";
import { dateFormatter } from "@/utils/formatters";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import SlideOver from "@gridcore/ui/components/overlays/SlideOver";
import Table, { TableColumn } from "../shared/Table";
import TransactionDetail from "./TransactionDetail";
import { useAtomValue } from "jotai";
import { userAtom } from "@gridcore/api-client";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [openTranxDetail, setOpenTranxDetail] = useState(false);

  const user: any = useAtomValue(userAtom);

  const transactionsQuery = useQuery({
    queryKey: ["transactions", currentPage],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/transactions/me?page=${currentPage}&perPage=10`,
      );
      return res.data.data;
    },
    onSuccess(data) {
      setTransactions(data.data);
      setTotalPages(data.meta.lastPage);
    },
    keepPreviousData: true,
  });

  const handleViewDetail = (trnxId: string) => {
    const transaction: any = transactions.find(
      (trxn: any) => trxn.id === trnxId,
    );
    setSelectedTransaction(transaction);
    setOpenTranxDetail(true);
  };

  const actions = ({ id }: { id: string }) => {
    return (
      <button onClick={() => handleViewDetail(id)} className="gradient-text">
        View Details
      </button>
    );
  };

  const columns: TableColumn[] = [
    { label: "Reference", key: "reference", emphasized: true },
    {
      label: "Amount",
      key: "amount",
      formatter: (value: number) =>
        formatCurrency({ currency: user?.associatedMerchant?.currency?.code, amount: value, country: user?.associatedMerchant?.country?.code }),
    },
    {
      label: "Type",
      key: "type",
      formatter: (value: string) => sentenceCaseFormatter(value),
    },
    {
      label: "Channel",
      key: "source",
      formatter: (value: string) => sentenceCaseFormatter(value),
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
    <div className="px-8 sm:px-6 pt-6 pb-1 rounded-md shadow-xs ring-1 ring-gray-300">
      <h2 className="text-2xl font-medium mb-2">Transaction History</h2>

      <Table
        columns={columns}
        data={transactions}
        loading={transactionsQuery.isFetching}
        currentPage={currentPage}
        actions={actions}
        totalPages={totalPages}
        setCurrentPage={(page: number) => setCurrentPage(page)}
      />

      {openTranxDetail && (
        <SlideOver
          open={openTranxDetail}
          setOpen={setOpenTranxDetail}
          title="Transaction detail"
        >
          <TransactionDetail transaction={selectedTransaction} />
        </SlideOver>
      )}
    </div>
  );
}

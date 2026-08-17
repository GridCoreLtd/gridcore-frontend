
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import SlideOver from "@gridcore/ui/components/overlays/SlideOver";
import type { TableColumn } from "@/components/shared/Table";
import Table from "@/components/shared/Table";
import { TransactionDetail } from "@/entities/transaction";
import axiosInstance from "@/utils/axios-instance";
import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { currencyFormatter, dateFormatter } from "@/utils/formatters";

const TransactionsTable = ({ userId }: { userId: string }) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [openTranxDetail, setOpenTranxDetail] = useState(false);

  const transactionsQuery = useQuery({
    queryKey: ["transactions", currentPage],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/transactions/users/${userId}?page=${currentPage}&perPage=10`
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
      (trxn: any) => trxn.id === trnxId
    );
    setSelectedTransaction(transaction);
    setOpenTranxDetail(true);
  };

  const actions = ({ id }: { id: string }) => {
    return (
      <button onClick={() => handleViewDetail(id)} className="text-primary">
        View Details
      </button>
    );
  };

  const columns: TableColumn[] = [
    { label: "Reference", key: "reference", emphasized: true },
    {
      label: "Customer's Name",
      key: "user",
      formatter: (value: any) => `${value?.firstName} ${value?.lastName}`,
    },
    {
      label: "Amount",
      key: "amount",
      formatter: (value: number) => currencyFormatter.format(value),
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
      label: "Associated Merchant",
      key: "user",
      formatter: (value: any) => value?.associatedMerchant?.businessName,
    },
    {
      label: "Date",
      key: "createdAt",
      formatter: (value: any) => dateFormatter.format(new Date(value)),
    },
  ];

  return (
    <section>
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
    </section>
  );
};

export default TransactionsTable;

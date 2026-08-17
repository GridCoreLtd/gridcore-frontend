
import axiosInstance from "@/utils/axios-instance";
import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { formatCurrency } from "@gridcore/ui/lib/format";
import { dateFormatter } from "@/utils/formatters";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import SlideOver from "@gridcore/ui/components/overlays/SlideOver";
import Table, { TableColumn } from "../shared/Table";
import TopupDetail from "../topup/TopupDetail";
import { useAtomValue } from "jotai";
import { userAtom } from "@gridcore/api-client";

export default function TopupHistory() {
  const [topups, setTopups] = useState([]);
  const [selectedTopup, setSelectedTopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [openTopupDetail, setOpenTopupDetail] = useState(false);

  const user: any = useAtomValue(userAtom);

  const topupsQuery = useQuery({
    queryKey: ["topups", currentPage],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/topups/me?page=${currentPage}&perPage=10`,
      );
      return res.data.data;
    },
    onSuccess(data) {
      setTopups(data.data);
      setTotalPages(data.meta.lastPage);
    },
    keepPreviousData: true,
  });

  const handleViewDetail = (topupId: string) => {
    const topup: any = topups.find((topup: any) => topup.id === topupId);
    setSelectedTopup(topup);
    setOpenTopupDetail(true);
  };

  const actions = ({ id }: { id: string }) => {
    return (
      <button onClick={() => handleViewDetail(id)} className="gradient-text">
        View Details
      </button>
    );
  };

  const columns: TableColumn[] = [
    {
      label: "Meter No.",
      key: "meter",
      formatter: (value) => value?.meterNumber,
      emphasized: true,
    },
    {
      label: "Meter Type",
      key: "meter",
      formatter: (value) => value?.meterType,
    },
    {
      label: "Payment Ref.",
      key: "transaction",
      formatter: (value) => sentenceCaseFormatter(value?.reference),
    },
    {
      label: "Amount",
      key: "transaction",
      formatter: (value) =>
        formatCurrency({ currency: user?.associatedMerchant?.currency?.code, amount: value?.amount, country: user?.associatedMerchant?.country?.code }),
    },
    {
      label: "Token",
      key: "token",
    },
    {
      label: "Status",
      key: "topupStatus",
      formatter: (value: string) => sentenceCaseFormatter(value),
    },
    {
      label: "Date",
      key: "createdAt",
      formatter: (value: any) => dateFormatter.format(new Date(value)),
    },
  ];

  return (
    <section className="px-8 sm:px-6 pt-6 pb-1 rounded-md shadow-xs ring-1 ring-gray-300">
      <h2 className="text-2xl font-medium mb-2">Top Up History</h2>

      <Table
        columns={columns}
        data={topups}
        loading={topupsQuery.isFetching}
        currentPage={currentPage}
        actions={actions}
        totalPages={totalPages}
        setCurrentPage={(page: number) => setCurrentPage(page)}
      />

      {openTopupDetail && (
        <SlideOver
          open={true}
          setOpen={setOpenTopupDetail}
          title="Top up detail"
        >
          <TopupDetail topup={selectedTopup} />
        </SlideOver>
      )}
    </section>
  );
}

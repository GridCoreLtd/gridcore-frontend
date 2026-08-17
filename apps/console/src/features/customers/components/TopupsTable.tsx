
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import SlideOver from "@gridcore/ui/components/overlays/SlideOver";
import type { TableColumn } from "@/components/shared/Table";
import Table from "@/components/shared/Table";
import { TopupDetail } from "@/entities/topup";
import axiosInstance from "@/utils/axios-instance";
import { sentenceCaseFormatter } from "@gridcore/ui/lib/format";
import { currencyFormatter, dateFormatter } from "@/utils/formatters";

const TopupsTable = ({ userId }: { userId: string }) => {
  const [topups, setTopups] = useState([]);
  const [selectedTopup, setSelectedTopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [openTopupDetail, setOpenTopupDetail] = useState(false);

  const topupsQuery = useQuery({
    queryKey: ["topups", currentPage],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/topups/users/${userId}?page=${currentPage}&perPage=10`
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
      <button onClick={() => handleViewDetail(id)} className="text-primary">
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
      label: "Payment Ref.",
      key: "transaction",
      formatter: (value) => sentenceCaseFormatter(value?.reference),
    },
    {
      label: "Customer's Name",
      key: "user",
      formatter: (value: any) => `${value?.firstName} ${value?.lastName}`,
    },
    {
      label: "Amount",
      key: "transaction",
      formatter: (value) => currencyFormatter.format(value?.amount),
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
    <section>
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
};

export default TopupsTable;

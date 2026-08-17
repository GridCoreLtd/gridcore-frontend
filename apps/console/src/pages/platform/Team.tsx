
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";

import NotificationModal from "@gridcore/ui/components/overlays/NotificationModal";
import SearchInput from "@/components/shared/SearchInput";
import SlideOver from "@gridcore/ui/components/overlays/SlideOver";
import type { TableColumn } from "@/components/shared/Table";
import Table from "@/components/shared/Table";
import { NewAdminUser } from "@/features/team";
import axiosInstance from "@/utils/axios-instance";
import { dateFormatter } from "@/utils/formatters";



export default function Team() {
  const [openNewUser, setOpenNewUser] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [users, setUsers] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const handleNewUser = () => {
    setOpenNewUser(true);
  };

  const { register, watch } = useForm();
  const searchQuery = watch("userSearch");
  const [debouncedSearchQuery] = useDebounce(searchQuery || "", 500);

  const usersQuery = useQuery({
    queryKey: ["users", currentPage, debouncedSearchQuery],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/users?page=${currentPage}&perPage=10&accountType=admin&search=${debouncedSearchQuery}`,
      );
      return res.data.data;
    },
    onSuccess(data) {
      setUsers(data.data);
      setTotalPages(data.meta.lastPage);
    },
    keepPreviousData: true,
  });

  const actions = ({ id }: { id: string }) => {
    return (
      <div className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
        <button className="text-red-500">Delete User</button>
      </div>
    );
  };

  const columns: TableColumn[] = [
    { label: "First Name", key: "firstName", emphasized: true },
    { label: "Last Name", key: "lastName" },
    {
      label: "Phone Number",
      key: "phone",
    },
    {
      label: "Email Address",
      key: "email",
    },
    {
      label: "Role",
      key: "role",
      formatter: (value: any) => value.displayName,
    },
    {
      label: "Date Added",
      key: "createdAt",
      formatter: (value: any) => dateFormatter.format(new Date(value)),
    },
  ];

  return (
    <main className="container max-w-full">
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <h2 className="text-2xl font-medium">Team</h2>

        <button
          onClick={handleNewUser}
          className="flex justify-center rounded-md gradient-bg py-[0.56rem] px-3 sm:px-6 gap-x-2 text-sm font-medium text-white shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add New User</span>
        </button>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-4 lg:gap-8 mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            register={register}
            id="userSearch"
            placeholder="Search by user name, phone number or email"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={users}
        loading={usersQuery.isFetching}
        currentPage={currentPage}
        totalPages={totalPages}
        // actions={actions}
        setCurrentPage={(page: number) => setCurrentPage(page)}
      />

      {openNewUser && (
        <SlideOver
          open={openNewUser}
          setOpen={setOpenNewUser}
          title="Add new user"
        >
          <NewAdminUser
            refetchUsers={usersQuery.refetch}
            closeSlideOver={() => setOpenNewUser(false)}
            showNotification={(message: string) => {
              setNotificationMessage(message);
              setShowNotifModal(true);
            }}
          />
        </SlideOver>
      )}

      <NotificationModal
        open={showNotifModal}
        setOpen={setShowNotifModal}
        onCloseAction={() => {
          setShowNotifModal(false);
        }}
        title="Success"
        type="success"
      >
        {notificationMessage}
      </NotificationModal>
    </main>
  );
}

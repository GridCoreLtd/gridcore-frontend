
import type { TableColumn } from "@/components/shared/Table";
import Table from "@/components/shared/Table";
import { dateFormatter } from "@/utils/formatters";

const actions = ({ id }: { id: string }) => {
  return (
    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
      <button className="text-red-500">Delete User</button>
    </td>
  );
};

const MerchantTeamTable = ({ merchant }: any) => {
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
      formatter: (value: any) => value?.displayName,
    },
    {
      label: "Date Added",
      key: "createdAt",
      formatter: (value: any) => dateFormatter.format(new Date(value)),
    },
  ];

  return (
    <section>
      <Table
        columns={columns}
        data={merchant.merchantAdmins}
        currentPage={1}
        totalPages={1}
        // actions={actions}
        setCurrentPage={(page: number) => 1}
      />
    </section>
  );
};

export default MerchantTeamTable;

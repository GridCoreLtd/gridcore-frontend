
import { useScopes } from "@/auth/useScopes";
import Button from "@gridcore/ui/components/Button";
import ButtonExport from "@/components/shared/Button/ButtonExport";
import Modal from "@gridcore/ui/components/overlays/Modal";
import NotificationModal from "@gridcore/ui/components/overlays/NotificationModal";
import type { FilterConfig } from "@/components/shared/reusable-filter/FilterInputFactories";
import ReusableTableFilter from "@/components/shared/ReusableTableFilter";
import SearchInput from "@/components/shared/SearchInput";
import SlideOver from "@gridcore/ui/components/overlays/SlideOver";
import TanStackTable from "@/components/shared/TanStackTable";

import { EditMeter } from "./components/EditMeter";
import { TopUpMeter } from "./components/TopUpMeter";
import { useMeterService } from "./hooks/useMeterService";


export function Meters() {
  const { isPlatform } = useScopes();
  const { meters, loading, pagination, filter, search, columns, actions } =
    useMeterService();

  const filters: FilterConfig[] = [
    ...(isPlatform
      ? [
          {
            key: "merchantId",
            label: "Merchant",
            type: "select" as const,
            options: filter.merchantOptions,
            placeholder: "Filter by merchant",
          },
        ]
      : []),
    {
      key: "meterType",
      label: "Meter Type",
      type: "select",
      options: filter.meterTypeOptions,
      placeholder: "Filter by meter type",
    },
    {
      key: "meterBrand",
      label: "Meter Brand",
      type: "select",
      options: filter.meterBrandOptions,
      placeholder: "Filter by meter brand",
    },
  ];

  return (
    <main className="container max-w-full">
      <h2 className="text-2xl font-medium mb-6">Meters</h2>

      <div className="flex justify-between items-end gap-4 lg:gap-8 mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            register={search.register}
            id={search.id}
            placeholder={search.placeholder}
          />
        </div>

        <section className="flex gap-4">
          <div>
            <ReusableTableFilter
              filters={filters}
              onApply={filter.onApply}
              initialValues={filter.activeFilters}
            />
          </div>
          <div className="flex-shrink-0">
            <ButtonExport
              handleDownload={actions.topUp.onTopUp}
              disabled={false}
              topup={true}
            >
              Top Up
            </ButtonExport>
          </div>
        </section>
      </div>

      <TanStackTable
        columns={columns}
        data={meters}
        loading={loading}
        pageCount={pagination.totalPages}
        pagination={{
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        }}
        setPagination={pagination.setPagination}
        onPageSizeChange={pagination.onPageSizeChange}
      />

      {actions.edit.open && (
        <SlideOver
          title="Edit Meter"
          open={actions.edit.open}
          setOpen={actions.edit.setOpen}
        >
          <EditMeter
            meter={actions.edit.selectedMeter}
            closeSlideOver={() => actions.edit.setOpen(false)}
            showNotification={(message: string) => {
              actions.notification.setMessage(message);
              actions.notification.setShowModal(true);
            }}
          />
        </SlideOver>
      )}

      {actions.topUp.open && (
        <SlideOver
          title="Top Meter"
          open={actions.topUp.open}
          setOpen={actions.topUp.setOpen}
        >
          <TopUpMeter closeSlideOver={() => actions.topUp.setOpen(false)} />
        </SlideOver>
      )}

      <NotificationModal
        open={actions.notification.showModal}
        setOpen={actions.notification.setShowModal}
        title="Success"
        type="success"
      >
        {actions.notification.message}
      </NotificationModal>

      <Modal
        open={actions.delete.confirmOpen}
        setOpen={actions.delete.setConfirmOpen}
      >
        <div className="text-lg text-center mt-4">
          Are you sure you want to delete this meter?
        </div>

        <div className="flex gap-4 flex-wrap sm:flex-nowrap justify-center mt-8">
          <Button
            text="No"
            height="33px"
            width="100px"
            variant="outline"
            className="ring-1 ring-accent ring-inset"
            onClick={() => actions.delete.setConfirmOpen(false)}
          />

          <Button
            text="Yes"
            height="33px"
            width="100px"
            variant="destructive"
            onClick={actions.delete.confirmDelete}
            isLoading={actions.delete.isDeleting}
          />
        </div>
      </Modal>
    </main>
  );
}


import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import SlideOver from "@gridcore/ui/components/overlays/SlideOver";
import type { TableColumn } from "@/components/shared/Table";
import Table from "@/components/shared/Table";
import axiosInstance from "@/utils/axios-instance";
import { dateFormatter } from "@/utils/formatters";

import { ApplySiteChargeAdmin } from "./ApplySiteChargeAdmin";
import { EditSiteAdmin } from "./EditSiteAdmin";


type Mode = "new" | "edit" | "none";
interface Selected {
  name: string | null;
  location: string | null;
  tariff: number;
}

interface SiteChatge {
  open: boolean;
  mode: Mode;
  selected: Selected;
}

const Sites = ({ merchant }: any) => {
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [openApplyCharge, setOpenApplyCharge] = useState(false);
  const [siteCharge, setSiteCharge] = useState<SiteChatge>({
    mode: "none",
    open: false,
    selected: {
      name: null,
      location: null,
      tariff: 0
    }
  })

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-sites", merchant?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/merchants/fetch-sites/${merchant.id}`);
      return res.data.data;
    },
    enabled: Boolean(merchant?.id),
  });

  const sites = data?.data ?? [];

  const applyChargeAction = (site: any) => {
    setSelectedSite(site);
    setOpenApplyCharge(true);
  };

  const editAction = (site: any) => {
    setSiteCharge((prev) => ({
      ...prev,
      open: true,
      selected: site,
      mode: "edit"
    }))
  };

  const actions = (site: any) => (
    <div className="flex gap-x-3">
      <button
        className="text-primary font-medium"
        onClick={() => applyChargeAction(site)}
      >
        Apply Charge
      </button>
      <button
        className="text-primary font-medium"
        onClick={() => editAction(site)}
      >
        Edit
      </button>
    </div>
  );

  const addNewSiteHandler = () => {
    setSiteCharge((prev) => ({
      ...prev,
      mode: "new",
      selected: {
        name: null,
        location: null,
        tariff: 0
      },
      open: true,
    }))
  }

  const columns: TableColumn[] = [
    { label: "Name", key: "name", emphasized: true },
    { label: "Location", key: "location" },
    {
      label: "Tariff",
      key: "tariff",
      formatter: (value: any) => (value ? value : "—"),
    },
    {
      label: "Date Added",
      key: "createdAt",
      formatter: (value: any) =>
        value ? dateFormatter.format(new Date(value)) : "—",
    },
  ];

  return (
    <section className="py-8">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <h1 className="text-xl font-bold">Sites</h1>
        <button
          onClick={addNewSiteHandler}
          className="flex justify-center rounded-md bg-primary py-[0.56rem] px-3 sm:px-6 gap-x-2 text-sm font-medium text-white shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Site</span>
        </button>
      </div>

      <div className="mt-10">
        <Table
          columns={columns}
          data={sites}
          loading={isLoading}
          currentPage={1}
          totalPages={1}
          actions={actions}
          setCurrentPage={() => 1}
        />
      </div>

      {openApplyCharge && selectedSite && (
        <SlideOver
          open={openApplyCharge}
          setOpen={setOpenApplyCharge}
          title={`Apply charge — ${selectedSite.name}`}
        >
          <ApplySiteChargeAdmin
            closeSlideOver={() => setOpenApplyCharge(false)}
            merchantId={merchant.id}
            selectedSite={selectedSite}
            currencyCode={merchant?.currencyCode ?? ""}
          />
        </SlideOver>
      )}

      {siteCharge.open && siteCharge.mode !== "none" && (
        <SlideOver
          open={siteCharge.open}
          setOpen={(value) => setSiteCharge((prev) => ({ ...prev, open: value, mode: "none" }))}
          title={siteCharge.mode === "edit" ? `Edit site — ${siteCharge?.selected?.name ?? ""}` : siteCharge.mode === "new" ?  "Add New Site" : ""}
        >
          <EditSiteAdmin
            closeSlideOver={() => setSiteCharge((_) => ({
              open: false,
              selected: {
                name: null,
                location: null,
                tariff: 0
              },
              mode: "none"
            }))}
            merchantId={merchant.id}
            selectedSite={siteCharge.selected}
            mode={siteCharge.mode}
          />
        </SlideOver>
      )}
    </section>
  );
};

export default Sites;

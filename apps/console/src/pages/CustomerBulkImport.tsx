
import { useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, Download } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { ObjectSchema} from "yup";
import { mixed, object, string } from "yup";

import { useScopes } from "@/auth/useScopes";
import Button from "@gridcore/ui/components/Button";
import NotificationModal from "@gridcore/ui/components/overlays/NotificationModal";
import SelectInput from "@/components/shared/SelectInput";
import type { TableColumn } from "@/components/shared/Table";
import Table from "@/components/shared/Table";
import Textfield from "@/components/shared/Textfield";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";



interface CustomerForm {
  associatedMerchant?: string;
  spreadsheet: FileList;
}

const CustomerBulkImport = () => {
  const { isPlatform } = useScopes();
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">(
    "success"
  );

  // A merchant imports into their own book, so there is nothing to choose.
  const { data: merchants, isFetching: isMerchantsFetching } = useQuery({
    queryKey: ["merchants-list"],
    enabled: isPlatform,
    queryFn: async () => {
      const res = await axiosInstance.get("/merchants?page=1&perPage=1000");
      return res.data.data.data;
    },
  });

  const formattedMerchants =
    merchants?.map((merchant: any) => ({
      value: merchant.id,
      label: merchant.businessName,
    })) || [];

  const validationSchema: ObjectSchema<CustomerForm> = object({
    associatedMerchant: isPlatform
      ? string().required("Associated merchant is required")
      : string().optional(),
    spreadsheet: mixed()
      .required("Customer's spreadsheet is required")
      .test(
        "fileSize",
        "File too large. Maximum allowed size is 20MB.",
        (value: any) => {
          if (!value || value.length === 0) return true;
          return value[0].size <= 20 * 1024 * 1024;
        }
      ) as unknown as ObjectSchema<FileList>,
  });

  const columns: TableColumn[] = [
    { label: "First Name", key: "firstName" },
    { label: "Last Name", key: "lastName" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phone" },
    { label: "Meter Number", key: "meterNumber" },
    { label: "Meter Address", key: "meterAddress" },
    { label: "Tariff Index", key: "tariffIndex" },
    { label: "Tariff", key: "tariff" },
    { label: "Meter Type", key: "meterType" },
    { label: "Meter Brand", key: "meterBrand" },
  ];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    getValues,
  } = useForm<CustomerForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const mapKeys = (data: any[]) => {
    return data.map((item) => ({
      firstName: String(item["First Name"]),
      lastName: String(item["Last Name"]),
      email: String(item["Email"]),
      phone: String(item["Phone Number"]),
      meterNumber: String(item["Meter Number"]),
      meterAddress: String(item["Meter Address"]),
      tariffIndex: Number(item["Tariff Index"]),
      tariff: Number(item["Tariff"]),
      meterType: String(
        item["Meter Type (e.g. ELECTRICITY, WATER, GAS, TIME)"]
      ),
      meterBrand: String(item["Meter Brand (e.g. OTHERS, GSM)"]),
    }));
  };

  const handleDownloadTemplate = async () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      [
        "First Name",
        "Last Name",
        "Email",
        "Phone Number",
        "Meter Number",
        "Meter Address",
        "Tariff Index",
        "Tariff",
        "Meter Type (e.g. ELECTRICITY, WATER, GAS, TIME)",
        "Meter Brand (e.g. OTHERS, GSM)",
      ],
      [
        "John",
        "Doe",
        "john.doe@example.com",
        "08012345678",
        "1234567890",
        "123 Main St",
        1,
        100,
        "ELECTRICITY",
        "OTHERS",
      ],
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Customers");

    XLSX.writeFile(workbook, "Customers_Template.xlsx");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          if (event.target?.result instanceof ArrayBuffer) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet);

            const mappedData = mapKeys(parsedData);
            setParsedData(mappedData);

          } else {
            throw new Error("Invalid file data");
          }
        } catch (error) {
          console.error("Error processing file:", error);
          alert("Failed to process the file. Please try again.");
        }
      };

      reader.onerror = (event) => {
        console.error("Error reading file:", event.target?.error);
        alert("Failed to read the file. Please try again.");
      };

      try {
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Failed to read the file. Please try again.");
      }
    }
  };

  const bulkCustomerMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.post("/auth/create-customer-with-meter", reqData);
    },
    onError: (error: any) => {
      const problem = parseApiError(error);
      // Field errors render under their input; only a failure that maps to
      // nothing gets a toast. See architecture/10-api-errors.md.
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        toast.error(toastMessage(problem));
      }
    },
    onSuccess(data) {
      setNotificationType(data.data.data.errorReport ? "error" : "success");
      setNotificationMessage(
        data.data.data.errorReport
          ? data.data.data.errorReport
          : "Customers imported successfully"
      );
      setShowNotifModal(true);
    },
  });

  const onSubmit = async (data: CustomerForm) => {
    // Without an explicit merchant the server attributes the import to the
    // caller, which is the only option a merchant has.
    const rows = data.associatedMerchant
      ? parsedData.map((item) => ({
          ...item,
          associatedMerchant: data.associatedMerchant,
        }))
      : parsedData;

    bulkCustomerMutation.mutate(rows as any);
  };

  return (
    <main className="container max-w-full">
      <Link
        to="/customers"
        className=" inline-flex space-x-1.5 text-primary"
      >
        <ChevronLeft className="h-4 w-4 mt-[1.6px] text-primary" />
        <span>Go Back</span>
      </Link>

      <div className="mt-10">
        <div className="flex flex-wrap justify-between gap-4 items-end">
          <div>
            <h2 className="text-xl font-medium mb-1">Customer Bulk Import</h2>
            <p className="text-xs text-gray-500 max-w-sm">
              Import multiple customers at once using a spreadsheet. Download an
              Excel template to get started.
            </p>
          </div>

          <div>
            <Button
              text="Download Excel Template"
              prefixIcon={<Download className="h-4 w-4" />}
              onClick={handleDownloadTemplate}
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-8 w-full max-w-md"
        >
          <div className="space-y-6">
            {isPlatform && (
              <Controller
                name="associatedMerchant"
                control={control}
                render={({ field }) => (
                  <SelectInput
                    options={formattedMerchants}
                    id="associatedMerchant"
                    label="Associated merchant"
                    isClearable
                    placeholder="Select merchant"
                    isLoading={isMerchantsFetching}
                    onChange={(value) => field.onChange(value)}
                    error={errors.associatedMerchant?.message}
                  />
                )}
              />
            )}

            <Textfield
              type="file"
              accept=".csv, .xlsx, .xls"
              id="spreadsheet"
              label="Customer's spreadsheet"
              register={register}
              error={errors.spreadsheet?.message}
              onChange={handleFileChange}
            />

            <Button
              type="submit"
              text="Submit"
              width="200px"
              isLoading={bulkCustomerMutation.isLoading}
            />
          </div>
        </form>
      </div>

      <div className="mt-14">
        {parsedData.length > 0 && (
          <div>
            <h3 className="text-xl font-bold">Data Preview</h3>
            <Table
              columns={columns}
              data={parsedData}
              loading={false}
              currentPage={1}
              totalPages={1}
              setCurrentPage={() => {}}
            />
          </div>
        )}
      </div>

      <NotificationModal
        open={showNotifModal}
        setOpen={setShowNotifModal}
        actionButtonText="Return to Customers List"
        onCloseAction={() => {
          setShowNotifModal(false);
          window.location.href = "/customers";
        }}
        title={notificationType === "success" ? "Success" : "Error"}
        type={notificationType}
      >
        {notificationMessage}
      </NotificationModal>
    </main>
  );
};

export default CustomerBulkImport;

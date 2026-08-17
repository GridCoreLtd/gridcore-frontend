
import { useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ObjectSchema} from "yup";
import { mixed, object, string } from "yup";

import Button from "@gridcore/ui/components/Button";
import SelectInput from "@/components/shared/SelectInput";
import Textarea from "@/components/shared/Textarea";
import Textfield from "@/components/shared/Textfield";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";
import { uploadFile, UploadUnavailableError } from "@/utils/upload";




interface IMerchantForm {
  businessName: string;
  shortBusinessName: string;
  contactEmail: string;
  businessWebsite: string;
  businessDescription: string;
  businessAddress: string;
  businessLogo: FileList;
  cacDocument: FileList;
  merchantType: string;
}

const EditMerchant = ({ merchant, closeEdit }: any) => {
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const validationSchema: ObjectSchema<IMerchantForm> = object({
    businessName: string().required("Business name is required"),
    shortBusinessName: string().required("Short business name is required"),
    contactEmail: string().required("Contact email is required"),
    businessWebsite: string().required("Business website is required"),
    businessDescription: string().required("Business description is required"),
    merchantType: string().required("Business merchantType is required"),
    businessAddress: string().required("Business address is required"),
    businessLogo: mixed()
      .required("Business logo is required")
      .test(
        "fileSize",
        "File too large. Maximum allowed size is 10MB.",
        (value: any) => {
          if (!value || value.length === 0) return true;
          return value[0].size <= 10 * 1024 * 1024;
        }
      )
      .nullable() as unknown as ObjectSchema<FileList>,
    cacDocument: mixed()
      .required("CAC certificate is required")
      .test(
        "fileSize",
        "File too large. Maximum allowed size is 10MB.",
        (value: any) => {
          if (!value || value.length === 0) return true;
          return value[0].size <= 10 * 1024 * 1024;
        }
      )
      .nullable() as unknown as ObjectSchema<FileList>,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    getValues,
  } = useForm<IMerchantForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
    defaultValues: {
      businessName: merchant.businessName,
      shortBusinessName: merchant.shortBusinessName,
      contactEmail: merchant.contactEmail,
      businessWebsite: merchant.businessWebsite,
      businessDescription: merchant.businessDescription,
      businessAddress: merchant.businessAddress,
      merchantType: merchant.merchantType,
    },
  });

  const editMerchantMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.patch(`/merchants/${merchant.id}`, reqData);
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
      toast.success(data.data.message);
      queryClient.invalidateQueries({ queryKey: ["merchant-detail"] });
      toast.success("Merchant profile updated successfully");
      closeEdit();
    },
  });


  const onSubmit = async (data: any) => {
    setIsLoading(true);

    let logoUrl = merchant.businessLogo || "";
    let certificateUrl = merchant.cacDocument || "";

    // Abort rather than submit: a failed upload previously assigned null over
    // the existing URL, wiping the merchant's stored document.
    try {
      if (data.businessLogo && data.businessLogo[0]) {
        logoUrl = await uploadFile(data.businessLogo[0]);
      }

      if (data.cacDocument && data.cacDocument[0]) {
        certificateUrl = await uploadFile(data.cacDocument[0]);
      }
    } catch (error) {
      toast.error(
        error instanceof UploadUnavailableError
          ? error.message
          : "Failed to upload files. Please try again."
      );
      setIsLoading(false);
      return;
    }

    const payload = {
      ...data,
      businessLogo: logoUrl,
      cacDocument: certificateUrl,
    };

    editMerchantMutation.mutate(payload);

    setIsLoading(false);
  };

  const formattedMerchants = [
    { value: "WEB", label: "WEB" },
    { value: "API", label: "API" },
  ];

  return (
    <section>
      <h1 className="text-xl font-bold mb-6">Edit Business Details</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Textfield
            type="text"
            id="businessName"
            label="Business Name"
            placeholder="Enter your business name"
            register={register}
            error={errors.businessName?.message}
          />

          <Textfield
            type="text"
            id="shortBusinessName"
            label="Short Business Name"
            placeholder="Enter your short business name"
            disabled
            register={register}
            error={errors.shortBusinessName?.message}
          />

          <Textfield
            type="email"
            id="contactEmail"
            label="Contact Email"
            placeholder="Enter your contact email"
            register={register}
            error={errors.contactEmail?.message}
          />

          <Textfield
            type="text"
            id="businessWebsite"
            label="Website"
            placeholder="Enter your business website"
            register={register}
            error={errors.businessWebsite?.message}
          />

          <Textarea
            type="text"
            id="businessDescription"
            label="Business Description"
            placeholder="Enter your business description"
            rows={4}
            register={register}
            error={errors.businessDescription?.message}
          />

          <Textarea
            type="text"
            id="businessAddress"
            label="Business Address"
            placeholder="Enter your business address"
            rows={4}
            register={register}
            error={errors.businessAddress?.message}
          />

          <Textfield
            type="file"
            accept=".jpeg, .jpg, .png, .pdf"
            id="businessLogo"
            label="Business Logo"
            register={register}
            error={errors.businessLogo?.message}
          />

          <Textfield
            type="file"
            accept=".jpeg, .jpg, .png, .pdf"
            id="cacDocument"
            label="CAC Certificate"
            register={register}
            error={errors.cacDocument?.message}
          />

          <SelectInput
            options={formattedMerchants}
            id="merchantType"
            label="Merchant Classification"
            isClearable
            placeholder="Select Merchant type"
            isLoading={false}
            {...register}
            //@ts-expect-error -- watch() widens to the whole form value union;
            // SelectInput wants this one field.
            value={watch("merchantType")}
            onChange={(option) => {
              //@ts-expect-error -- SelectInput hands back the bare value, not
              // the react-select option object its type still describes.
              const value: string = option;
              setValue("merchantType", value);
            }}
            error={errors.merchantType?.message}
          />
        </div>

        <div className="mt-10">
          <Button
            type="submit"
            text={`${editMerchantMutation?.isLoading ? "Saving..." : "Save changes"}`}
            width="200px"
            isLoading={isLoading}
          />
        </div>
      </form>
    </section>
  );
};

export default EditMerchant;

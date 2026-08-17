
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { number, object, string } from "yup";
import type { ObjectSchema} from "yup";

import Button from "@gridcore/ui/components/Button";
import Textfield from "@/components/shared/Textfield";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";

interface EditSiteAdminProps {
  closeSlideOver: () => void;
  merchantId: string;
  selectedSite: any;
  mode: "edit" | "new";
}

interface SiteForm {
  name: string;
  location?: string;
  tariff?: number;
}

export const EditSiteAdmin = ({
  closeSlideOver,
  merchantId,
  selectedSite,
  mode
}: EditSiteAdminProps) => {
  const queryClient = useQueryClient();

  const schema: ObjectSchema<SiteForm> = object({
    name: string().required("Name is required"),
    location: string().optional(),
    tariff: number()
      .transform((value, original) => (original === "" ? undefined : value))
      .optional(),
  });

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<SiteForm>({
    resolver: yupResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: selectedSite?.name ?? "",
      location: selectedSite?.location ?? "",
      tariff:
        selectedSite?.tariff && selectedSite.tariff > 0
          ? selectedSite.tariff
          : undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (reqData: any) => {
      const apiReq = {
        edit: () => axiosInstance.patch(`/merchants/edit-site/${selectedSite?.id}`, reqData),
        new: () => axiosInstance.patch(`/merchants/add-site-account/${merchantId}`, reqData)
      };

      return apiReq[mode]()
    },
    onError: (error: any) => {
      const problem = parseApiError(error);
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        toast.error(toastMessage(problem));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-sites", merchantId] });
      toast.success("Site updated");
      closeSlideOver();
    },
  });

  const onSubmit = (data: SiteForm) =>
    mutation.mutate({
      name: data.name,
      location: data.location,
      tariff: data.tariff,
    });

  return (
    <section>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <Textfield
            type="text"
            id="name"
            label="Name"
            placeholder="Enter name"
            register={register}
            error={errors.name?.message}
          />
          <Textfield
            type="text"
            id="location"
            label="Location"
            placeholder="Enter location"
            register={register}
            error={errors.location?.message}
          />
          <Textfield
            type="number"
            id="tariff"
            label="Tariff (applies to meters under this site)"
            placeholder="Enter the tariff"
            register={register}
            error={errors.tariff?.message}
          />
        </div>

        <div className="mt-12">
          <Button
            type="submit"
            text="Save"
            isLoading={mutation.isLoading}
            width="150px"
          />
        </div>
      </form>
    </section>
  );
};

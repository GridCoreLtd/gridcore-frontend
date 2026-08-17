
import React from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ObjectSchema} from "yup";
import { object, string } from "yup";

import Button from "@gridcore/ui/components/Button";
import SelectInput from "@/components/shared/SelectInput";
import Textfield from "@/components/shared/Textfield";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import axiosInstance from "@/utils/axios-instance";






interface NewAdminUserProps {
  refetchUsers: () => void;
  closeSlideOver: () => void;
  showNotification: (message: string) => void;
}

interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export const NewAdminUser = ({
  refetchUsers,
  closeSlideOver,
  showNotification,
}: NewAdminUserProps) => {
  const { data: roles, isFetching: isRolesFetching } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/roles");
      return res.data.data.data;
    },
  });

  const formattedRoles =
    roles?.map((role: any) => ({
      value: role.id,
      label: role.displayName,
    })) || [];

  const validationSchema: ObjectSchema<UserForm> = object({
    firstName: string()
      .min(3, "Name must be at least 3")
      .required("First name is required"),
    lastName: string()
      .min(3, "Name must be at least 3")
      .required("Last name is required"),
    email: string().email().required("Email address is required"),
    phone: string().required("Phone number is required"),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    getValues,
  } = useForm<UserForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const newAdminMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.post("/auth/create-admin", reqData);
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
      refetchUsers();
      closeSlideOver();
      showNotification(data.data.message);
    },
  });

  const onSubmit = (data: UserForm) => {
    const reqData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: "superAdmin",
    };
    newAdminMutation.mutate(reqData as any);
  };

  return (
    <section>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <Textfield
            type="text"
            id="firstName"
            label="First name"
            placeholder="Enter first name"
            register={register}
            error={errors.firstName?.message}
          />

          <Textfield
            type="text"
            id="lastName"
            label="Last name"
            placeholder="Enter last name"
            register={register}
            error={errors.lastName?.message}
          />

          <Textfield
            type="tel"
            id="phone"
            label="Phone number"
            placeholder="Enter phone number"
            register={register}
            error={errors.phone?.message}
          />

          <Textfield
            type="email"
            id="email"
            label="Email"
            placeholder="Enter email address"
            register={register}
            error={errors.email?.message}
          />

          {/* <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <SelectInput
                options={formattedRoles}
                id="role"
                label="Role"
                isClearable
                placeholder="Select role"
                isLoading={isRolesFetching}
                onChange={(value) => field.onChange(value)}
                error={errors.role?.message}
              />
            )}
          /> */}
        </div>

        <div className="mt-12">
          <Button
            type="submit"
            text="Submit"
            isLoading={newAdminMutation.isLoading}
            width="150px"
          />
        </div>
      </form>
    </section>
  );
};

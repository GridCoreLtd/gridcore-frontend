
import { ObjectSchema, object, string } from "yup";
import Button from "@gridcore/ui/components/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios-instance";
import { toast } from "react-toastify";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";

const ChangePassword = () => {
  interface PasswordUpdateForm {
    currentPassword: string;
    newPassword: string;
  }

  const validationSchema: ObjectSchema<PasswordUpdateForm> = object({
    currentPassword: string()
      .required("Current password is required")
      .min(6, "Must be at least 4 characters"),
    newPassword: string()
      .required("New password is required")
      .min(6, "Must be at least 6 characters"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<PasswordUpdateForm>({
    resolver: yupResolver(validationSchema),
  });

  const passwordMutation = useMutation({
    mutationFn: async (reqData: PasswordUpdateForm) => {
      return axiosInstance.patch("/auth/change-password", reqData);
    },
    onError: (error: any) => {
      const problem = parseApiError(error);
      // Field errors render under their input; only a failure that maps to
      // nothing gets a toast. See architecture/10-api-errors.md.
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        toast.error(toastMessage(problem));
      }
    },
    onSuccess() {
      toast.success("Password changed successfully");
    },
  });

  const onSubmit = (reqData: PasswordUpdateForm) => {
    passwordMutation.mutate(reqData as any);
  };

  return (
    <section>
      <h2 className="text-2xl font-medium mb-2">Change Password</h2>
      <div className="text-accent mb-6">You can change your password here</div>

      <div className="bg-white px-6 sm:px-8 py-10 shadow-xs ring-1 ring-gray-300 rounded-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium leading-6"
              >
                Current Password
              </label>
              <div className="mt-2 relative rounded-md">
                <input
                  id="currentPassword"
                  {...register("currentPassword")}
                  type="password"
                  placeholder="Enter your new password"
                />
              </div>
              <p className="text-red-500 text-xs mt-2">
                {errors.currentPassword?.message}
              </p>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium leading-6"
              >
                New Password
              </label>
              <div className="mt-2 relative rounded-md">
                <input
                  id="newPassword"
                  {...register("newPassword")}
                  type="password"
                  placeholder="Confirm your password"
                />
              </div>
              <p className="text-red-500 text-xs mt-2">
                {errors.newPassword?.message}
              </p>
            </div>
          </div>

          <div className="flex sm:justify-end mt-8">
            <Button
              type="submit"
              text="Save Changes"
              isLoading={passwordMutation.isLoading}
              width="180px"
            />
          </div>
        </form>
      </div>
    </section>
  );
};

export default ChangePassword;

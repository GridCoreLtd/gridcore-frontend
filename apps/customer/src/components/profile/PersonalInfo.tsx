
import { ObjectSchema, object, string } from "yup";
import Button from "@gridcore/ui/components/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios-instance";
import { toast } from "react-toastify";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEffect } from "react";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";

const PersonalInfo = () => {
  const { userProfile, refetchProfile } = useUserProfile();

  interface ProfileUpdateForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }

  const validationSchema: ObjectSchema<ProfileUpdateForm> = object({
    firstName: string().required("First name is required"),
    lastName: string().required("Last name is required"),
    email: string().email().required("Email is required"),
    phone: string().required("Phone number is required"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    getValues,
  } = useForm<ProfileUpdateForm>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    reset({
      firstName: userProfile?.firstName,
      lastName: userProfile?.lastName,
      email: userProfile?.email,
      phone: userProfile?.phone,
    });
  }, [userProfile, reset]);

  const profileMutation = useMutation({
    mutationFn: async (reqData: ProfileUpdateForm) => {
      return axiosInstance.patch("/users/me", {
        firstName: reqData.firstName,
        lastName: reqData.lastName,
      });
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
      refetchProfile();
      toast.success("Profile updated successfully");
    },
  });

  const onSubmit = (reqData: ProfileUpdateForm) => {
    profileMutation.mutate(reqData as any);
  };

  return (
    <section>
      <h2 className="text-2xl font-medium mb-2">Profile Info</h2>
      <div className="text-accent mb-6">
        You can view and update your personal details here
      </div>

      <div className="bg-white px-6 sm:px-8 py-10 shadow-xs ring-1 ring-gray-300 rounded-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium leading-6"
              >
                First name
              </label>
              <div className="mt-2 relative rounded-md">
                <input
                  id="firstName"
                  type="text"
                  {...register("firstName")}
                  placeholder="Enter your first name"
                />
              </div>
              <p className="text-red-500 text-xs mt-2">
                {errors.firstName?.message}
              </p>
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium leading-6"
              >
                Last name
              </label>
              <div className="mt-2 relative rounded-md">
                <input
                  id="lastName"
                  type="text"
                  {...register("lastName")}
                  placeholder="Enter your last name"
                />
              </div>
              <p className="text-red-500 text-xs mt-2">
                {errors.lastName?.message}
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6"
              >
                Enter email
              </label>
              <div className="mt-2 relative rounded-md">
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email"
                  disabled
                />
              </div>
              <p className="text-red-500 text-xs mt-2">
                {errors.email?.message}
              </p>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium leading-6"
              >
                Phone number
              </label>
              <div className="mt-2 relative rounded-md">
                <input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="Enter phone number"
                  disabled
                />
              </div>
              <p className="text-red-500 text-xs mt-2">
                {errors.phone?.message}
              </p>
            </div>
          </div>

          <div className="flex sm:justify-end mt-8">
            <Button
              type="submit"
              text="Save Changes"
              isLoading={profileMutation.isLoading}
              width="180px"
            />
          </div>
        </form>
      </div>
    </section>
  );
};

export default PersonalInfo;

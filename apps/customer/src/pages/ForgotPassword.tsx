
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { object, string, ObjectSchema } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/axios-instance";
import { useMutation } from "@tanstack/react-query";
import Button from "@gridcore/ui/components/Button";
import Textfield from "@/components/shared/Textfield";
import { useUserProfile } from "@/hooks/useUserProfile";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import { Lock, Phone } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();

  interface ForgotPasswordForm {
    phone: string;
  }

  const phoneRegExp =
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

  const validationSchema: ObjectSchema<ForgotPasswordForm> = object({
    phone: string()
      .matches(phoneRegExp, "Phone number is not valid")
      .required("Phone number is required"),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const phoneNumber = watch("phone");

  const forgotPasswordMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.post("/auth/forgot-password", reqData);
    },
    onError: (error: unknown) => {
      // Was falling through to the interceptor's toast. A rejected
      // phone/token belongs on that input. See architecture/10-api-errors.md.
      const problem = parseApiError(error);
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        setError("root.serverError", {
          type: problem.code,
          message: toastMessage(problem),
        });
      }
    },
    onSuccess(data: any) {
      toast.success(data.data.message);
      navigate(`/password-reset?phone=${phoneNumber}`);
    },
  });

  const onSubmit = (reqData: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(reqData as any);
  };

  return (
    <main className="container min-h-screen py-12 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="flex-1">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link to="/">
            <img
              src="/images/logo.png"
              alt="PayGo Dash logo"
              className="w-[140px] h-auto mx-auto"
            />
          </Link>

          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Forgot Password?
          </h2>
          <div className="text-accent font-light text-sm">
            Enter your registered phone number below
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-8"
            >
              <Textfield
                type="tel"
                id="phone"
                label="Phone number"
                placeholder="Enter your phone number"
                InputIcon={Phone}
                register={register}
                error={errors.phone?.message}
              />

              <div>
                <Button
                  type="submit"
                  text="Submit"
                  width="100%"
                  isLoading={forgotPasswordMutation.isLoading}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;

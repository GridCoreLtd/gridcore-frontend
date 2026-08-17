
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { object, string, ObjectSchema } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/axios-instance";
import { useMutation, useQuery } from "@tanstack/react-query";
import Button from "@gridcore/ui/components/Button";
import Textfield from "@/components/shared/Textfield";
import { useUserProfile } from "@/hooks/useUserProfile";
import { applyFieldErrors, parseApiError, toastMessage } from "@gridcore/api-client";
import { Lock, Phone } from "lucide-react";

const MerchantLogin = () => {
  const { userProfile, refetchProfile } = useUserProfile();
  const navigate = useNavigate();
  // Next injected `params` as a prop; React Router reads it from the route.
  const { slug: shortBusinessName } = useParams<{ slug: string }>();

  const { data: merchant, isFetched } = useQuery({
    queryKey: ["merchant-detail", shortBusinessName],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/merchants/mini-detail/${shortBusinessName}`
      );
      return res.data.data;
    },
  });

  interface LoginForm {
    phone: string;
    password: string;
  }

  const phoneRegExp =
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

  const validationSchema: ObjectSchema<LoginForm> = object({
    phone: string()
      .matches(phoneRegExp, "Phone number is not valid")
      .required("Phone number is required"),
    password: string()
      .min(6, "Must be at least 6 characters")
      .required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<LoginForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const loginMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.post("/auth/login", reqData);
    },
    onError: (error: any) => {
      const problem = parseApiError(error);
      // Field errors render under their input; only a failure that maps to
      // nothing gets a toast. See architecture/10-api-errors.md.
      if (applyFieldErrors(problem, setError, Object.keys(getValues() ?? {}))) {
        toast.error(toastMessage(problem));
      }
    },
    onSuccess(data: any) {
      const { tokens } = data.data.data;
      Cookies.set("access_token", tokens.accessToken);
      refetchProfile();
      navigate("/dashboard");
    },
  });

  const onSubmit = (reqData: LoginForm) => {
    loginMutation.mutate(reqData as any);
  };

  const logo = isFetched
    ? merchant
      ? merchant?.businessLogo
      : "/images/logo-yellow.png"
    : "/images/logo-yellow.png";

  const logoMobile = isFetched
    ? merchant
      ? merchant?.businessLogo
      : "/images/logo-white.svg"
    : "/images/logo-white.svg";
  return (
    <main className="lg:grid lg:grid-cols-2">
      <div
        style={{ backgroundImage: `url('/images/login-bg.png')` }}
        className="text-center bg-cover bg-center h-screen hidden lg:flex"
      >
        <div className="bg-black/10 h-full w-full flex-col justify-center px-8 flex">
          <img src={logo} alt="GridCore Logo" width={230} />
          <h2 className="text-5xl text-white max-w-[552px]  text-left leading-[4rem] mt-5 font-semibold">
            Powering Africa&apos;s <br />
            Intelligent <span className="text-[#E0E04C]">Energy</span> Future
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-center h-screen">
        <div className="w-full max-w-[448px] mx-auto px-5">
          <img
            src={logoMobile}
            alt="GridCore Logo"
            width={230}
            className="mx-auto mb-5 lg:hidden"
          />
          <section className="mb-8 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-primary">Welcome Back</h2>
            <p className="text-[#6B7280] mt-1">
              Sign in to access your GridCore account
            </p>
          </section>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
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

            <Textfield
              type="password"
              id="password"
              label="Password"
              placeholder="Enter your password"
              InputIcon={Lock}
              register={register}
              error={errors.password?.message}
            />

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                text="Sign in"
                width="100%"
                isLoading={loginMutation.isLoading}
              />
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default MerchantLogin;

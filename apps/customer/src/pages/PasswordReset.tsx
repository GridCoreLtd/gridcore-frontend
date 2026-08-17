
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { object, string, ObjectSchema, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/axios-instance";
import { useMutation } from "@tanstack/react-query";
import Button from "@gridcore/ui/components/Button";
import Textfield from "@/components/shared/Textfield";
import React, { useEffect, useState } from "react";
import { Lock, MessageCircleMore } from "lucide-react";

interface PasswordResetForm {
  token: string;
  password: string;
  passwordConfirm: string;
}

const PasswordReset = () => {
  const [countdown, setCountdown] = useState(60);
  const [resendActive, setResendActive] = useState(false);

  const navigate = useNavigate();
  // Next injected `searchParams` as a prop; React Router reads the query string.
  const [searchParams] = useSearchParams();
  const phone = searchParams.get("phone") ?? "";

  useEffect(() => {
    if (countdown > 0) {
      const timerId = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else {
      setResendActive(true);
    }
  }, [countdown]);

  const validationSchema: ObjectSchema<PasswordResetForm> = object({
    token: string()
      .length(6, "The OTP must be exactly 6 characters")
      .required("OTP is required"),
    password: string()
      .min(6, "Must be at least 6 characters")
      .required("Password is required"),
    passwordConfirm: string()
      .oneOf([ref("password")], "Passwords must match")
      .required("Password confirmation is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetForm>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const passwordResetMutation = useMutation({
    mutationFn: async (reqData) => {
      return axiosInstance.post("/auth/reset-password", reqData);
    },
    onSuccess(data: any) {
      toast.success(data.data.message);
      navigate("/");
    },
  });

  const resendOTPMutation = useMutation({
    mutationFn: async (reqData) => {
      setResendActive(false);
      return await axiosInstance.post("/auth/forgot-password", reqData);
    },
    onError() {
      setResendActive(true);
    },
    onSuccess() {
      toast.success("Another OTP has been sent to your phone.");
      setCountdown(60);
      setResendActive(false);
    },
  });

  const handleResendOTP = async () => {
    resendOTPMutation.mutate({ phone } as any);
  };

  const onSubmit = (reqData: PasswordResetForm) => {
    passwordResetMutation.mutate(reqData as any);
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
            Reset Your Password
          </h2>
          <div className="text-accent font-light text-sm mt-1">
            To reset your password, please enter the OTP sent to your registered
            mobile number, along with your new password below.
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Textfield
                id="token"
                label="OTP (Sent to your phone)"
                placeholder="Enter the OTP that was sent to your phone"
                maxLength="6"
                InputIcon={MessageCircleMore}
                register={register}
                error={errors.token?.message}
              />

              <div className="flex justify-between items-center mt-3 text-sm">
                <div className="text-gray-600">
                  {countdown > 0 ? `0:${countdown}s` : ""}
                </div>
                <div
                  className={`font-medium ${
                    resendActive
                      ? "text-secondary cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={resendActive ? handleResendOTP : undefined}
                >
                  Resend OTP
                </div>
              </div>

              <hr className="my-8" />

              <div className="space-y-5">
                <Textfield
                  type="password"
                  id="password"
                  label="Password"
                  placeholder="Enter your password"
                  InputIcon={Lock}
                  register={register}
                  error={errors.password?.message}
                />

                <Textfield
                  type="password"
                  id="passwordConfirm"
                  label="Confirm Password"
                  placeholder="Retype your password"
                  InputIcon={Lock}
                  register={register}
                  error={errors.passwordConfirm?.message}
                />
              </div>

              <div className="mt-8">
                <Button
                  type="submit"
                  text="Submit"
                  width="100%"
                  isLoading={passwordResetMutation.isLoading}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PasswordReset;

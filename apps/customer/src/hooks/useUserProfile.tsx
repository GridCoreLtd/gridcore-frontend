import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios-instance";
import { useAtom } from "jotai";
import { userAtom } from "@gridcore/api-client";
import Cookies from "js-cookie";

export const useUserProfile = () => {
  const [_user, setUser] = useAtom(userAtom);
  const token = Cookies.get("access_token");

  const fetchUserProfile = async () => {
    const response = await axiosInstance.get("/users/me");
    return response.data;
  };

  const { data, isError, error, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  const refetchProfile = async () => {
    const { data } = await refetch();
    setUser(data?.data);
  };

  return {
    userProfile: data?.data,
    refetchProfile,
    error,
    isError,
    isLoading,
    isRefetching,
  };
};


import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Loader from "@gridcore/ui/components/overlays/Loader";
import NotificationModal from "@gridcore/ui/components/overlays/NotificationModal";
import SlideOver from "@gridcore/ui/components/overlays/SlideOver";
import { MeterCards } from "@/features/meters";
import { CustomerTabs, NewMeter, PersonalDetails } from "@/features/customers";
import axiosInstance from "@/utils/axios-instance";


export default function CustomerDetail() {
  const routeParams = useParams();
  const [assignMeter, setAssignMeter] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const userId = routeParams.id ?? "";

  const handleAssignMeter = () => {
    setAssignMeter(true);
  };

  const customerDetailQuery = useQuery({
    queryKey: ["customerDetail"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/users/${userId}`);
      return res.data.data;
    },
    onSuccess(data) {
      setUser(data);
    },
  });

  return (
    <main className="container">
      <Link
        to="/customers"
        className=" inline-flex space-x-1.5 text-primary"
      >
        <ChevronLeft className="h-4 w-4 mt-[1.6px] text-primary" />
        <span>Go Back</span>
      </Link>

      {customerDetailQuery.isLoading ? (
        <Loader setOpen={() => true} message="Loading..." />
      ) : (
        <div>
          <div className="mt-14">
            <h2 className="text-xl font-medium mb-2">Personal Details</h2>

            <PersonalDetails user={user} />
          </div>

          <div className="mt-14">
            <div className="flex justify-between items-end mb-6 max-w-sm">
              <h2 className="text-xl font-medium">Assigned Meters</h2>

              <button
                onClick={handleAssignMeter}
                className="flex items-center justify-center rounded-sm gradient-bg py-[0.4rem] px-3 gap-x-1 text-xs font-medium text-white shadow-xs"
              >
                <Plus className="h-3 w-3" />
                <span>Assign New Meter</span>
              </button>
            </div>

            {!customerDetailQuery.isLoading && user && (
              <MeterCards meters={user.meters} />
            )}
          </div>

          <div className="mt-14">
            <CustomerTabs userId={userId} />
          </div>

          {assignMeter && (
            <SlideOver
              open={assignMeter}
              setOpen={setAssignMeter}
              title="Assign new meter"
            >
              <NewMeter
                userId={userId}
                refetchCustomer={customerDetailQuery.refetch}
                closeSlideOver={() => setAssignMeter(false)}
                showNotification={(message: string) => {
                  setNotificationMessage(message);
                  setShowNotifModal(true);
                }}
              />
            </SlideOver>
          )}

          <NotificationModal
            open={showNotifModal}
            setOpen={setShowNotifModal}
            title="Success"
            type="success"
          >
            {notificationMessage}
          </NotificationModal>
        </div>
      )}
    </main>
  );
}

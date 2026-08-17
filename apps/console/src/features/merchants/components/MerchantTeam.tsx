
import { useState } from "react";

import { Plus } from "lucide-react";

import SlideOver from "@gridcore/ui/components/overlays/SlideOver";

import TeamTable from "@/components/MerchantTeamTable";
import { NewMerchantUser } from "@/entities/merchant";


const MerchantTeam = ({ merchant }: any) => {
  const [openNewUser, setOpenNewUser] = useState(false);

  const handleNewUser = () => {
    setOpenNewUser(true);
  };

  return (
    <section className="py-8">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <h1 className="text-xl font-bold">List of Users</h1>

        <button
          onClick={handleNewUser}
          className="flex justify-center rounded-md gradient-bg py-[0.56rem] px-3 sm:px-6 gap-x-2 text-sm font-medium text-white shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="mt-10">
        <TeamTable merchant={merchant} />
      </div>

      {openNewUser && (
        <SlideOver
          open={openNewUser}
          setOpen={setOpenNewUser}
          title="Add new user"
        >
          <NewMerchantUser
            closeSlideOver={() => setOpenNewUser(false)}
            merchantId={merchant.id}
          />
        </SlideOver>
      )}
    </section>
  );
};

export default MerchantTeam;

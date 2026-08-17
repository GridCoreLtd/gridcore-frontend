import { formatCurrency } from "@gridcore/ui/lib/format";

export default function PersonalDetails({ user }: any) {
  return (
    <section className="flex gap-6 flex-wrap sm:flex-nowrap">
      <div className="basis-full sm:basis-9/12 bg-white ring-1 ring-gray-300 hover:bg-gray-100 rounded-md py-6 px-8 flex flex-wrap gap-6 justify-between h-auto">
        <div>
          <div className="text-gray-400 text-xs mb-1">First Name</div>
          <div className="font-medium">{user?.firstName}</div>
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-1">Last Name</div>
          <div className="font-medium">{user?.lastName}</div>
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-1">Phone Number</div>
          <div className="font-medium">{user?.phone}</div>
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-1">Email</div>
          <div className="font-medium">{user?.email}</div>
        </div>
      </div>

      <div className="basis-full sm:basis-3/12 bg-primary shadow-xs rounded-md p-6 h-auto">
        <div className="text-gray-300 text-xs mb-1">Wallet Balance</div>
        <div className="text-white font-bold text-2xl">
          {formatCurrency({ country: user?.associatedMerchant?.country?.code, currency: user?.associatedMerchant?.currency?.code, amount: user?.wallet?.balance })}
        </div>
      </div>
    </section>
  );
}

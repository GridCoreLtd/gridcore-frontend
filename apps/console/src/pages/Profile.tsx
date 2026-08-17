import { AccountInfo, ChangePassword, TwoFactorSection } from "@/features/profile";

export default function Profile() {
  return (
    <div className="grid max-w-5xl items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <AccountInfo />

      <div className="flex flex-col gap-6">
        <TwoFactorSection />

        <ChangePassword />
      </div>
    </div>
  );
}

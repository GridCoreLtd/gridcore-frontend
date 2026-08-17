import ChangePassword from "@/components/profile/ChangePassword";
import PersonalInfo from "@/components/profile/PersonalInfo";

export default function Profile() {
  return (
    <main className="my-10 container max-w-4xl space-y-12">
      <PersonalInfo />

      <ChangePassword />
    </main>
  );
}

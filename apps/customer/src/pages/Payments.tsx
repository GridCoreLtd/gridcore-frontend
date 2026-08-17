import MyWallet from "@/components/payments/MyWallet";
import TransactionHistory from "@/components/payments/TransactionHistory";

export default function Payments() {
  return (
    <main className="container my-10 max-w-6xl space-y-10">
      <MyWallet />

      <div>
        <TransactionHistory />
      </div>
    </main>
  );
}

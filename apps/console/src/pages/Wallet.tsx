import { WalletLedger } from "@/features/wallet";

export default function WalletPage() {
  return (
    <WalletLedger
      csvName="wallet-ledger.csv"
      tableTitle="Wallet"
    />
  );
}

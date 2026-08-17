import { ArrowDownLeft } from "lucide-react";
import { Zap } from "lucide-react";

export default function ButtonExport({
  handleDownload,
  children,
  disabled,
  topup,
}: {
  handleDownload: () => void;
  children: React.ReactNode;
  disabled: boolean;
  topup?: boolean;
}) {
  return (
    <button
      onClick={handleDownload}
      disabled={disabled}
      className={`${disabled ? "bg-[#ccc]" : "bg-primary"} cursor-pointer text-white text-[14px] min-w-[128px] py-2 px-3 w-[100%] rounded-[10px] gap-1 flex items-center justify-center`}
    >
      {topup ? (
        <Zap className="h-4 w-4" />
      ) : (
        <ArrowDownLeft className="h-4 w-4 text-[#FFFFFF]" />
      )}
      {children}
    </button>
  );
}

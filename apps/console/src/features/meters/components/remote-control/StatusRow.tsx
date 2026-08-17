import type { FC, ReactNode } from "react";

interface StatusRowProps {
  icon: ReactNode;
  label: string;
  status: boolean;
}

const StatusRow: FC<StatusRowProps> = ({ icon, label, status }) => {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">{icon}</div>
        <p className="text-gray-700 font-medium">{label}</p>
      </div>

      <div
        className={`flex items-center gap-2 px-4 py-1 rounded-full ${
          status ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}
      >
        {status ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4"
            />
          </svg>
        )}
        <span className="capitalize">{status ? "Online" : "Offline"}</span>
      </div>
    </div>
  );
};

export default StatusRow;

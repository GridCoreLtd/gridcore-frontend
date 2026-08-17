export default function StatusIndicator({ isOnline }: { isOnline: boolean }) {
    return (
      <div className="mb-4 w-24 h-5 py-1 flex items-center justify-end rounded-full border border-gray-300">
        <span className="text-[12px] font-medium">Online Status</span>
        <div
          className={`bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>
    );
  }
  
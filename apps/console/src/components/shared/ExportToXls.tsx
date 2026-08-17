
export default function ExportToXls() {
  return (
    <div>
      <button className="flex justify-center rounded-md bg-gray-200 hover:bg-gray-300 py-[0.56rem] px-3 sm:px-6 gap-x-2 text-[0.8rem] font-regular text-gray-700 shadow-xs ring-1 ring-gray-300 hover:ring-gray-400">
        <img src="/icons/excel.svg" className="h-4 w-4" alt="Microsoft Excel" />
        <span>Export to XLS</span>
      </button>
    </div>
  );
}

import { Signal } from "lucide-react";

interface Props {
  strength: number; // e.g. 87
}

export default function SignalStrengthCard({ strength }: Props) {
  return (
    <div className="bg-white border rounded-xl p-5 mt-6">
      <div className="flex items-center justify-between">
        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
          <Signal className="h-6 w-6" />
        </div>
        <p className="text-gray-700 font-medium">Excellent</p>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="h-2 bg-gray-200 rounded-full w-full">
          <div
            className="h-2 bg-green-600 rounded-full"
            style={{ width: `${strength}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">{strength}% strength</p>
      </div>
    </div>
  );
}

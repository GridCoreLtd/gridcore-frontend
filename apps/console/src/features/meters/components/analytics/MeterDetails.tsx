import React from "react";

export function MeterDetails({ meterDetails }: { meterDetails: any }) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Meter Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="font-medium text-gray-700">Meter ID:</div>
          <div className="text-gray-900">{meterDetails?.meterId}</div>
          <div className="font-medium text-gray-700">Base Year:</div>
          <div className="text-gray-900">{meterDetails?.baseYear}</div>
          <div className="font-medium text-gray-700">SGC New:</div>
          <div className="text-gray-900">{meterDetails?.sgcNew}</div>
          <div className="font-medium text-gray-700">Latitude:</div>
          <div className="text-gray-900">{meterDetails?.lat}</div>
          <div className="font-medium text-gray-700">Longitude:</div>
          <div className="text-gray-900">{meterDetails?.lng}</div>
          <div className="font-medium text-gray-700">Create ID:</div>
          <div className="text-gray-900">{meterDetails?.createId}</div>
        </div>
      </div>
    </div>
  );
}

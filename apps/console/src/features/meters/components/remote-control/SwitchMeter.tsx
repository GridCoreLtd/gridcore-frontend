import React from "react";

import SelectInput from "@/components/shared/SelectInput";

const SwitchMeter = () => {
  return (
    <section className="flex flex-col gap-3 sm:items-center sm:flex-row">
      <label className="font-semibold">Meter</label>
      <SelectInput id="meter" options={[]} className="sm:w-[12rem] w-full" />
    </section>
  );
};

export default SwitchMeter;

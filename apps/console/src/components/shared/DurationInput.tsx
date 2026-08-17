import type React from "react";
import { useEffect, useState } from "react";

import Textfield from "@/components/shared/Textfield";

interface DurationInputProps {
  value?: number;
  onChange: (minutes: number) => void;
  error?: string;
}

const DurationInput: React.FC<DurationInputProps> = ({
  value = 0,
  onChange,
  error,
}) => {
  const [days, setDays] = useState(Math.floor(value / 1440).toString());
  const [hours, setHours] = useState(
    Math.floor((value % 1440) / 60).toString()
  );
  const [minutes, setMinutes] = useState((value % 60).toString());

  useEffect(() => {
    const d = Math.max(parseInt(days) || 0, 0); // Prevent negative values
    const h = Math.max(parseInt(hours) || 0, 0);
    const m = Math.max(parseInt(minutes) || 0, 0);
    onChange(d * 1440 + h * 60 + m);
  }, [days, hours, minutes, onChange]);

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^\d*$/.test(value)) {
        // Allow only numbers
        setter(value);
      }
    };

  return (
    <div className="flex gap-4 p-4 bg-gray-100 rounded-lg shadow-md">
      <Textfield
        type="number"
        id="days"
        label="Day(s)"
        placeholder="0"
        min={0}
        value={days}
        onChange={handleChange(setDays)}
        error={error}
        className="w-1/3"
      />
      <Textfield
        type="number"
        id="hours"
        label="Hour(s)"
        placeholder="0"
        min={0}
        value={hours}
        onChange={handleChange(setHours)}
        error={error}
        className="w-1/3"
      />
      <Textfield
        type="number"
        id="minutes"
        label="Minute(s)"
        placeholder="0"
        min={0}
        value={minutes}
        onChange={handleChange(setMinutes)}
        error={error}
        className="w-1/3"
      />
    </div>
  );
};

export default DurationInput;

import { MeterTypes } from "./types";

// Extracts unit text from strings like: "Voltage(V)"
export const extractUnit = (dataPrefix: string): string | null => {
  const match = dataPrefix.match(/\((.*?)\)/);
  return match ? match[1] : null;
};

// Extracts the metric name before the unit
export const extractMetricKey = (dataPrefix: string): string => {
  return dataPrefix.replace(/\(.*?\)/, "").trim();
};

// Count occurrences of a given key
export const countBy = <T>(
  data: T[],
  keyFn: (item: T) => string
): Record<string, number> => {
  return data?.reduce<Record<string, number>>((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
};

// Detects the phase letter or number from the metric name or key
export const extractPhase = (name: string): string | null => {
  const match = name.match(/phase[-\s]?([abc123])/i);
  return match ? match[1].toUpperCase() : null;
};

export const isMeterMetricEnabled = (meterBrand: string): boolean =>
  meterBrand === MeterTypes.GSM ||
  meterBrand === MeterTypes.LORA ||
  meterBrand === MeterTypes.CALIN;

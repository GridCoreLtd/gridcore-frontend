import { formatDistanceToNow, subMinutes } from "date-fns";

export const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// export const dateFormatter = new Intl.DateTimeFormat("en-US", {
//   year: "numeric",
//   month: "short",
//   day: "numeric",
// });

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  // hour12: false, // or true if you want AM/PM
});

export const shortCurrencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  notation: "compact",
});

export const timeAgo = (stringDate: string): string => {
  const date = new Date(stringDate);
  const result = formatDistanceToNow(date, { addSuffix: true });
  return result;
};

/** First letters of the first two words — the initials tiles beside names. */
export const initials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase();
};

/**
 * Display formatting shared by the apps.
 *
 * `formatCurrency` takes a named argument on purpose. It replaces two
 * `newCurrencyFormatter` functions that had the same name and *different*
 * positional orders — `(country, currency, amount)` in the console and
 * `(currency, amount, country)` in the customer app. Both took strings and a
 * number, so getting them the wrong way round compiled cleanly and produced a
 * plausible-looking wrong currency. A named argument cannot be mis-ordered.
 */

/** Currency and country may arrive as a code string or as a relation object. */
type CodeLike = string | { code?: string; symbol?: string; currencyCode?: string } | null | undefined;

const currencyCode = (currency: CodeLike): string => {
  const raw =
    typeof currency === "string"
      ? currency
      : (currency?.code ?? currency?.currencyCode ?? "");
  return /^[A-Za-z]{3}$/.test(raw) ? raw.toUpperCase() : "NGN";
};

const currencyLabel = (currency: CodeLike): string => {
  if (typeof currency === "string") return currency || "NGN";
  return currency?.symbol ?? currency?.code ?? "NGN";
};

const countryCode = (country: CodeLike): string => {
  const raw = typeof country === "string" ? country : (country?.code ?? "");
  return /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : "NG";
};

interface CurrencyArgs {
  amount: number | null | undefined;
  currency?: CodeLike;
  country?: CodeLike;
}

export function formatCurrency({
  amount,
  currency = "NGN",
  country = "NG",
}: CurrencyArgs): string {
  const num = Number(amount);
  const safe = Number.isFinite(num) ? num : 0;
  try {
    return new Intl.NumberFormat(`en-${countryCode(country)}`, {
      style: "currency",
      currency: currencyCode(currency),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    // Intl throws on an unknown currency code; fall back to a plain label.
    return `${currencyLabel(currency)} ${safe.toLocaleString()}`;
  }
}

/** Like `formatCurrency`, but prefixes the symbol instead of using Intl's. */
export function formatCurrencyPlain({
  amount,
  currency = "NGN",
  country = "NG",
}: CurrencyArgs): string {
  const num = Number(amount);
  const safe = Number.isFinite(num) ? num : 0;
  const label = currencyLabel(currency);
  try {
    return `${label} ${safe.toLocaleString(`en-${countryCode(country)}`, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  } catch {
    return `${label} ${safe.toLocaleString()}`;
  }
}

export const sentenceCaseFormatter = (text: string) => {
  if (typeof text != "string" || text.length === 0) {
    return "";
  }

  const trimmedText = text.trim();
  const firstChar = trimmedText.charAt(0).toUpperCase();
  const remainingChars = trimmedText.slice(1).toLowerCase();

  return firstChar + remainingChars;
};

/** The values are the channel slugs the API expects, not display labels. */
export const bankChannels = {
  WEMA: "wema-bank",
  TITAN: "titan-paystack",
};

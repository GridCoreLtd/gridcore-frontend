/**
 * Returns year options for select dropdowns (current year going back N years).
 * Used for dashboard stats and chart comparison filters.
 */
export function getYearSelectOptions(yearsBack: number = 5): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: yearsBack + 1 }, (_, i) => {
    const year = currentYear - i;
    return { value: String(year), label: String(year) };
  });
}

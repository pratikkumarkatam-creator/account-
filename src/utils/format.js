const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹1,23,456.00 */
export function formatCurrency(value) {
  return currency.format(Number(value) || 0);
}

/** Short form for stat cards: ₹1.24 L */
export function formatCompactCurrency(value) {
  const amount = Number(value) || 0;
  const absolute = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absolute >= 10000000) return `${sign}₹${(absolute / 10000000).toFixed(2)} Cr`;
  if (absolute >= 100000) return `${sign}₹${(absolute / 100000).toFixed(2)} L`;
  if (absolute >= 1000) return `${sign}₹${(absolute / 1000).toFixed(1)}K`;
  return formatCurrency(amount);
}

/** 2026-11-19 -> 19 Nov 2026 */
export function formatDate(isoDate, options = {}) {
  if (!isoDate) return "-";
  const date = new Date(`${String(isoDate).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function toISODate(date) {
  const copy = new Date(date);
  const offset = copy.getTimezoneOffset();
  return new Date(copy.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function todayISO() {
  return toISODate(new Date());
}

export function daysAgoISO(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISODate(date);
}

export function monthStartISO() {
  const date = new Date();
  return toISODate(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function lastSixMonthsStartISO() {
  const date = new Date();
  return toISODate(new Date(date.getFullYear(), date.getMonth() - 5, 1));
}

export function getPeriodPresets() {
  return [
    { id: "30", label: "Last 30 days", start: daysAgoISO(30), end: todayISO() },
    { id: "90", label: "Last 90 days", start: daysAgoISO(90), end: todayISO() },
    { id: "current_month", label: "This month", start: monthStartISO(), end: todayISO() },
    { id: "6m", label: "Last 6 months", start: lastSixMonthsStartISO(), end: todayISO() },
  ];
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export function todayLabel() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

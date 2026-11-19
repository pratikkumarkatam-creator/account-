const TONES = {
  credit: "bg-emerald-50 text-credit ring-emerald-100",
  debit: "bg-red-50 text-debit ring-red-100",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
  navy: "bg-navy text-white ring-navy",
  info: "bg-royal-50 text-royal ring-blue-100",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
        TONES[tone] || TONES.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

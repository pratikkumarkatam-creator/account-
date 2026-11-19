import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-royal text-white hover:bg-royal-700 shadow-sm",
  dark: "bg-navy text-white hover:bg-navy-700 shadow-sm",
  secondary: "border border-slate-200 bg-white text-ink hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-ink",
  danger: "bg-debit text-white hover:bg-red-700 shadow-sm",
  "danger-soft": "border border-red-200 bg-red-50 text-debit hover:bg-red-100",
};

const SIZES = {
  sm: "h-9 gap-1.5 px-3 text-[13px]",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-11 gap-2 px-5 text-sm",
  icon: "h-9 w-9 justify-center",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal/20 disabled:cursor-not-allowed disabled:opacity-60 ${
        VARIANTS[variant] || VARIANTS.primary
      } ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
}

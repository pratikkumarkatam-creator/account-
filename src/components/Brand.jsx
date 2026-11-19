import { Landmark } from "lucide-react";

export default function Brand({ variant = "dark", size = "md", showTagline = false }) {
  const isLight = variant === "light";
  const markSize = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const titleSize = size === "sm" ? "text-[15px]" : "text-base";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex ${markSize} items-center justify-center rounded-xl ${
          isLight ? "bg-royal text-white" : "bg-navy text-white"
        } shadow-sm`}
      >
        <Landmark size={size === "sm" ? 18 : 20} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className={`${titleSize} font-semibold leading-tight ${isLight ? "text-white" : "text-ink"}`}>
          Account Statement
          <span className={`${isLight ? "text-blue-200" : "text-royal"} font-semibold`}> Generator</span>
        </p>
        {showTagline ? (
          <p className={`mt-0.5 text-[11px] ${isLight ? "text-slate-400" : "text-slate-500"}`}>
            Personal finance workspace
          </p>
        ) : null}
      </div>
    </div>
  );
}

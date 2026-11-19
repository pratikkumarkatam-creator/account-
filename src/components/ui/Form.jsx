import { AlertCircle } from "lucide-react";

export function FormField({ label, htmlFor, error, hint, required, children, className = "" }) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required ? <span className="ml-0.5 text-debit">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-debit">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ error, className = "", ...props }) {
  return <input className={`input ${error ? "input-error" : ""} ${className}`} {...props} />;
}

export function Select({ error, className = "", children, ...props }) {
  return (
    <select className={`input ${error ? "input-error" : ""} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ error, className = "", ...props }) {
  return (
    <textarea
      className={`input h-auto min-h-[80px] py-2.5 ${error ? "input-error" : ""} ${className}`}
      {...props}
    />
  );
}

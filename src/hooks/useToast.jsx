import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

const TONES = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-credit",
    bar: "bg-credit",
  },
  error: {
    icon: AlertTriangle,
    iconClass: "text-debit",
    bar: "bg-debit",
  },
  info: {
    icon: Info,
    iconClass: "text-royal",
    bar: "bg-royal",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (type, title, message) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current.slice(-3), { id, type, title, message }]);
      const timer = setTimeout(() => dismiss(id), 4500);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  const toast = useMemo(
    () => ({
      success: (title, message) => push("success", title, message),
      error: (title, message) => push("error", title, message),
      info: (title, message) => push("info", title, message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="no-print pointer-events-none fixed right-4 top-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((item) => {
          const tone = TONES[item.type] || TONES.info;
          const Icon = tone.icon;
          return (
            <div
              key={item.id}
              className="pointer-events-auto animate-toast-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lift"
            >
              <div className="flex items-start gap-3 p-3.5 pl-0">
                <span className={`h-full w-1 self-stretch rounded-r ${tone.bar}`} />
                <Icon size={18} className={`mt-0.5 shrink-0 ${tone.iconClass}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  {item.message ? (
                    <p className="mt-0.5 text-sm leading-5 text-slate-500">{item.message}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context;
}

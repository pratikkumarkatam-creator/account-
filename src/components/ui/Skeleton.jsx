export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} />;
}

export function StatSkeleton() {
  return (
    <div className="card p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-7 w-36" />
      <Skeleton className="mt-3 h-3 w-20" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="hidden h-3 w-24 sm:block" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

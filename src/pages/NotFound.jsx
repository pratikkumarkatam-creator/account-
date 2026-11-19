import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import Brand from "../components/Brand";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas px-6 text-center">
      <Brand />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal">Error 404</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">This page does not exist</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          The page you are looking for may have been moved. Return to your dashboard to continue.
        </p>
      </div>
      <Link to="/">
        <Button icon={ArrowLeft}>Back to dashboard</Button>
      </Link>
    </div>
  );
}

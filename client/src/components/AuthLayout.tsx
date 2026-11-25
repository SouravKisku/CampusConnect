import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="w-full max-w-md">
        <Logo />
        <div className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-5 text-center text-sm text-muted">{footer}</p>}
      </div>
    </div>
  );
}

export const AuthLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="font-medium text-brand hover:underline">{children}</Link>
);

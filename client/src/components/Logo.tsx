import { Link } from "react-router-dom";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-brand" />
      <path d="M11 9h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2Zm2 4v6h6v-2h-4v-4h-2Z" className="fill-on-brand" />
      <circle cx="23" cy="9" r="3" fill="rgb(var(--accent))" />
    </svg>
  );
}

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5 rounded-lg">
      <LogoMark />
      <span className="font-display text-lg font-bold tracking-tight">CampusConnect</span>
    </Link>
  );
}

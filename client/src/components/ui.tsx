import {
  forwardRef, useId, useState,
  type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "../lib/utils";

/* ---------- Button ---------- */
type Variant = "primary" | "secondary" | "ghost" | "danger";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  loading?: boolean;
}
const variants: Record<Variant, string> = {
  primary: "bg-brand text-on-brand hover:opacity-90",
  secondary: "border border-line bg-surface text-ink hover:bg-sunken",
  ghost: "text-ink hover:bg-sunken",
  danger: "bg-danger text-white hover:opacity-90",
};
export function Button({ variant = "primary", size = "md", loading, disabled, className, children, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-sm" : "h-10 px-4 text-sm",
        variants[variant],
        className
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- Form fields ---------- */
interface FieldShellProps { label: string; error?: string; hint?: string; id: string; children: ReactNode }
function FieldShell({ label, error, hint, id, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="mt-1 text-sm text-danger">{error}</p>
      ) : hint ? (
        <p id={`${id}-msg`} className="mt-1 text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
const controlClass = (error?: string) =>
  cn(
    "w-full rounded-lg border bg-surface px-3 text-sm placeholder:text-muted/70",
    error ? "border-danger" : "border-line hover:border-muted/50"
  );

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label: string; error?: string; hint?: string }
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, className, ...rest }, ref) {
  const id = useId();
  return (
    <FieldShell label={label} error={error} hint={hint} id={id}>
      <input ref={ref} id={id} aria-invalid={!!error} aria-describedby={error || hint ? `${id}-msg` : undefined} className={cn(controlClass(error), "h-10", className)} {...rest} />
    </FieldShell>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label: string; error?: string; hint?: string }
export function Select({ label, error, hint, className, children, ...rest }: SelectProps) {
  const id = useId();
  return (
    <FieldShell label={label} error={error} hint={hint} id={id}>
      <select id={id} aria-invalid={!!error} className={cn(controlClass(error), "h-10", className)} {...rest}>
        {children}
      </select>
    </FieldShell>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label: string; error?: string; hint?: string }
export function Textarea({ label, error, hint, className, ...rest }: TextareaProps) {
  const id = useId();
  return (
    <FieldShell label={label} error={error} hint={hint} id={id}>
      <textarea id={id} aria-invalid={!!error} className={cn(controlClass(error), "min-h-24 py-2", className)} {...rest} />
    </FieldShell>
  );
}

/* ---------- Tag input (skills, interests) ---------- */
interface TagInputProps { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; max?: number; error?: string }
export function TagInput({ label, value, onChange, placeholder, max = 15, error }: TagInputProps) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const tag = raw.trim().slice(0, 30);
    if (!tag || value.some((v) => v.toLowerCase() === tag.toLowerCase()) || value.length >= max) return setDraft("");
    onChange([...value, tag]);
    setDraft("");
  };
  return (
    <FieldShell label={label} id={id} error={error} hint={`Press Enter to add. Up to ${max}.`}>
      <div className={cn("flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border bg-surface p-1.5", error ? "border-danger" : "border-line")}>
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-brand-soft py-0.5 pl-2 pr-1 text-sm text-brand">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((v) => v !== tag))} aria-label={`Remove ${tag}`} className="rounded p-0.5 hover:bg-brand/10">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          placeholder={value.length ? "" : placeholder}
          onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value.slice(0, -1)) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(draft); }
            if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => draft && add(draft)}
          className="min-w-24 flex-1 bg-transparent px-1.5 py-1 text-sm placeholder:text-muted/70 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </FieldShell>
  );
}

/* ---------- Avatar ---------- */
const hue = (name: string) => [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
export function Avatar({ name, src, size = 40, className }: { name: string; src?: string; size?: number; className?: string }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (src) return <img src={src} alt="" style={style} className={cn("shrink-0 rounded-full object-cover", className)} />;
  return (
    <span
      aria-hidden
      style={{ ...style, background: `hsl(${hue(name)} 45% 42%)` }}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white", className)}
    >
      {initials}
    </span>
  );
}

/* ---------- Misc ---------- */
export const Skeleton = ({ className }: { className?: string }) => <div className={cn("animate-pulse rounded-md bg-sunken", className)} aria-hidden />;

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <section className={cn("rounded-2xl border border-line bg-surface p-5", className)}>{children}</section>
);

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "accent" | "success" }) {
  const tones = {
    neutral: "bg-sunken text-muted",
    brand: "bg-brand-soft text-brand",
    accent: "bg-accent/20 text-ink",
    success: "bg-success/15 text-success",
  };
  return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <div className="rounded-full bg-sunken p-3 text-muted">{icon}</div>
      <p className="font-medium">{title}</p>
      {children && <p className="max-w-xs text-sm text-muted">{children}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-8 text-center">
      <p className="text-sm text-muted">{message}</p>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

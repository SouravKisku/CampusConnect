import { motion, useReducedMotion } from "framer-motion";
import { Avatar } from "./ui";
import { ordinal } from "../lib/utils";

interface IdCardProps {
  name: string;
  line1: string; // department
  line2?: string; // course / semester
  tags?: string[];
  avatar?: string;
  swing?: boolean;
}

// The campus ID card is the product's signature element: it's what every account is, in one glance.
export function IdCard({ name, line1, line2, tags = [], avatar, swing }: IdCardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={swing && !reduce ? { rotate: -9, y: -24, opacity: 0 } : false}
      animate={{ rotate: swing ? -2 : 0, y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 70, damping: 9, mass: 1.1 }}
      style={{ transformOrigin: "50% 0%" }}
      className="relative w-full max-w-xs rounded-2xl bg-brand p-5 pt-9 text-on-brand shadow-xl"
    >
      <span aria-hidden className="absolute left-1/2 top-3 h-2 w-14 -translate-x-1/2 rounded-full bg-bg/80" />
      <div className="flex items-center gap-4">
        <Avatar name={name} src={avatar} size={64} className="ring-4 ring-on-brand/20" />
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-bold leading-tight">{name}</p>
          <p className="truncate text-sm opacity-80">{line1}</p>
          {line2 && <p className="truncate text-sm opacity-80">{line2}</p>}
        </div>
      </div>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.slice(0, 4).map((t) => (
            <span key={t} className="rounded-md bg-on-brand/15 px-2 py-0.5 text-xs">{t}</span>
          ))}
        </div>
      )}
      <div aria-hidden className="mt-5 h-6 rounded-sm opacity-60" style={{ background: "repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 5px, currentColor 5px 6px, transparent 6px 10px)" }} />
    </motion.div>
  );
}

export const semesterLabel = (n?: number) => (n ? `${ordinal(n)} semester` : undefined);

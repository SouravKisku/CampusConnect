import { env } from "../config/env.js";

// Only addresses on approved university domains may register.
// With no domains configured, development allows everything and production allows nothing (fail closed).
export function isAllowedUniversityEmail(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  if (env.allowedDomains.length === 0) return !env.isProd;
  return env.allowedDomains.some((d) => domain === d || domain.endsWith(`.${d}`));
}

import xss from "xss";

// Fields that must never be altered by sanitization (secrets are hashed, not rendered).
const RAW_KEYS = new Set(["password", "currentPassword", "newPassword", "token"]);

const xssOptions = { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ["script", "style"] };

export function sanitize(value, key) {
  if (typeof value === "string") return RAW_KEYS.has(key) ? value : xss(value, xssOptions);
  if (Array.isArray(value)) return value.map((v) => sanitize(v));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitize(v, k)]));
  }
  return value;
}

// Strips HTML from every string, then validates and coerces with a zod schema.
// Unknown fields are dropped, which also blocks mass-assignment (e.g. someone sending role: "admin").
export const validate =
  (schema, source = "body") =>
  (req, _res, next) => {
    const result = schema.safeParse(sanitize(req[source] ?? {}));
    if (!result.success) return next(result.error);
    req[source] = result.data;
    next();
  };

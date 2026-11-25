export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export const homePath = (role?: string) => (role === "admin" ? "/admin" : "/dashboard");

import "dotenv/config";

const isProd = process.env.NODE_ENV === "production";

// In production a missing secret must crash the process instead of silently using a weak default.
function secret(name, devDefault) {
  const value = process.env[name] || (isProd ? undefined : devDefault);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  isProd,
  port: Number(process.env.PORT || 5000),
  serverUrl: process.env.SERVER_URL || "http://localhost:5000",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campusconnect",
  jwtAccessSecret: secret("JWT_ACCESS_SECRET", "dev-only-access-secret"),
  jwtRefreshSecret: secret("JWT_REFRESH_SECRET", "dev-only-refresh-secret"),
  accessTtl: process.env.JWT_ACCESS_TTL || "15m",
  refreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS || 7),
  cookieSameSite: process.env.COOKIE_SAMESITE || "lax",
  allowedDomains: (process.env.ALLOWED_EMAIL_DOMAINS || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || "CampusConnect <no-reply@campusconnect.edu>",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};

export const cloudinaryEnabled = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);

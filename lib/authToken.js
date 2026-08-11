import crypto from "node:crypto";

export const ADMIN_COOKIE_NAME = "admin_session";

export function expectedAdminToken() {
  return crypto
    .createHash("sha256")
    .update(process.env.ADMIN_SESSION_SECRET || "dev-only-mock-secret")
    .digest("hex");
}

import LoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const raw = typeof params?.next === "string" ? params.next : "";
  // Only allow same-app relative paths — reject absolute/protocol-relative
  // URLs (e.g. "https://evil.com" or "//evil.com") to prevent open redirect.
  const nextPath =
    raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\")
      ? raw
      : "/admin";

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__logo">
          <span
            style={{
              width: 22,
              height: 22,
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 3,
            }}
            aria-hidden="true"
          >
            <span style={{ borderRadius: "40%", background: "var(--color-green)" }} />
            <span style={{ borderRadius: "40%", background: "var(--color-green)" }} />
            <span style={{ borderRadius: "40%", background: "var(--color-green)" }} />
            <span style={{ borderRadius: "40%", background: "var(--color-green)" }} />
          </span>
          Top Padel Admin
        </div>
        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}

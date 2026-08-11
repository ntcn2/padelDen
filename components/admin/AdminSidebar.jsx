"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/repositories/auth";

const ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/games", label: "Ближайшие игры" },
  { href: "/admin/pricing", label: "Цены" },
  { href: "/admin/gallery", label: "Галерея" },
  { href: "/admin/journal", label: "Padel Journal" },
  { href: "/admin/seo", label: "SEO" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <span className="admin-sidebar__logo-mark" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        Top Padel Admin
      </div>

      <nav className="admin-nav">
        {ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav__link${active ? " admin-nav__link--active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar__footer">
        <button
          type="button"
          className="admin-nav__link admin-nav__link--logout"
          onClick={async () => {
            await logout();
            router.push("/admin/login");
            router.refresh();
          }}
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function ProtectedAdminLayout({ children }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}

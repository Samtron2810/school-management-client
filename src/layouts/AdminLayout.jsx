import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import AdminSidebar from "../components/layout/AdminSidebar";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <AdminSidebar mobileOpen={mobileOpen} onToggleMobile={setMobileOpen} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

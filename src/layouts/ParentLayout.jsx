import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import ParentSidebar from "../components/layout/ParentSidebar";

export default function ParentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <ParentSidebar mobileOpen={mobileOpen} onToggleMobile={setMobileOpen} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

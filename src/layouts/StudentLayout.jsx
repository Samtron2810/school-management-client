import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import StudentSidebar from "../components/layout/StudentSidebar";

export default function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleMobile={() => setMobileOpen((prev) => !prev)} />
      <div className="flex">
        <StudentSidebar
          mobileOpen={mobileOpen}
          onToggleMobile={setMobileOpen}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

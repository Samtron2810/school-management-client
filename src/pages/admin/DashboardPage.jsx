import { useState } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
  FaClipboardCheck,
} from "react-icons/fa";
import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import NotificationsCard from "../../components/dashboard/NotificationsCard";
import ScheduleCard from "../../components/dashboard/ScheduleCard";
import Modal from "../../components/ui/Modal";

const stats = [
  { icon: FaUserGraduate, title: "Total Students", value: "1,245" },
  { icon: FaChalkboardTeacher, title: "Active Teachers", value: "48" },
  { icon: FaSchool, title: "Active Classes", value: "32" },
  { icon: FaClipboardCheck, title: "Upcoming Submissions", value: "15" },
];

export default function DashboardPage() {
  const [actionModal, setActionModal] = useState({ open: false, label: "" });

  const handleQuickAction = (label) => {
    setActionModal({ open: true, label });
  };

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-primary mb-6">
        School Management System - Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <QuickActions onAction={handleQuickAction} />
      </div>

      {/* Notifications + Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationsCard />
        <ScheduleCard />
      </div>

      {/* Quick Action Modal */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, label: "" })}
        title={actionModal.label}
      >
        <p className="text-sm text-slate-gray">
          The "{actionModal.label}" feature will be available soon.
        </p>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setActionModal({ open: false, label: "" })}
            className="px-4 py-2 rounded-lg text-sm bg-royal-blue text-white hover:bg-royal-blue/80 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}

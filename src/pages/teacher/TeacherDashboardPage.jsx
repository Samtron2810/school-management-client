import { useState } from "react";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaBook,
  FaClipboardCheck,
} from "react-icons/fa";
import StatCard from "../../components/dashboard/StatCard";

export default function TeacherDashboardPage() {
  const stats = [
    { icon: FaChalkboardTeacher, title: "My Classes", value: "6" },
    { icon: FaUserGraduate, title: "Total Students", value: "180" },
    { icon: FaBook, title: "Subjects", value: "4" },
    { icon: FaClipboardCheck, title: "Pending Assessments", value: "12" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">
        Teacher Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
          />
        ))}
      </div>
    </div>
  );
}

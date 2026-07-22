import { useState } from "react";
import { FaBook, FaSearch } from "react-icons/fa";
import SearchInput from "../../components/common/SearchInput";
import DataTable from "../../components/tables/DataTable";
import StatusBadge from "../../components/common/StatusBadge";

const initialClasses = [
  {
    id: 1,
    name: "JSS 1",
    subject: "Mathematics",
    students: 35,
    schedule: "Mon, Wed, Fri",
    status: "active",
  },
  {
    id: 2,
    name: "JSS 2",
    subject: "English",
    students: 32,
    schedule: "Tue, Thu, Fri",
    status: "active",
  },
  {
    id: 3,
    name: "SSS 1",
    subject: "Physics",
    students: 28,
    schedule: "Mon, Wed",
    status: "inactive",
  },
];

export default function MyClassesPage() {
  const [classes, setClasses] = useState(initialClasses);
  const [search, setSearch] = useState("");

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Class", accessor: "name" },
    { header: "Subject", accessor: "subject" },
    { header: "Students", accessor: "students" },
    { header: "Schedule", accessor: "schedule" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">My Classes</h1>
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search classes..."
        />
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}

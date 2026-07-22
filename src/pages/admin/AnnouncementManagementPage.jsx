import { useState } from "react";
import {
  FaBullhorn,
  FaPlus,
  FaSearch,
  FaTrashAlt,
  FaEdit,
  FaEye,
} from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/tables/DataTable";
import ActionButton from "../../components/buttons/ActionButton";
import SearchInput from "../../components/common/SearchInput";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";

const initialAnnouncements = [
  {
    id: 1,
    title: "School Reopening",
    target: "All",
    date: "2026-07-20",
    status: "active",
  },
  {
    id: 2,
    title: "Exam Schedule",
    target: "Students",
    date: "2026-07-18",
    status: "active",
  },
  {
    id: 3,
    title: "Holiday Notice",
    target: "All",
    date: "2026-07-10",
    status: "archived",
  },
];

export default function AnnouncementManagementPage() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: "",
    target: "All",
    date: "",
    content: "",
    status: "active",
  });

  const filtered = announcements.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Target", accessor: "target" },
    { header: "Date", accessor: "date" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={FaEye} onClick={() => {}} />
          <Button
            variant="ghost"
            size="sm"
            icon={FaEdit}
            onClick={() => {
              setSelected(row);
              setFormOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            onClick={() => {
              setSelected(row);
              setDeleteOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const handleSave = () => {
    if (selected) {
      setAnnouncements(
        announcements.map((a) =>
          a.id === selected.id ? { ...a, ...form } : a,
        ),
      );
    } else {
      setAnnouncements([...announcements, { id: Date.now(), ...form }]);
    }
    setFormOpen(false);
    setSelected(null);
    setForm({
      title: "",
      target: "All",
      date: "",
      content: "",
      status: "active",
    });
  };

  const handleDelete = () => {
    setAnnouncements(announcements.filter((a) => a.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Announcement Management"
        subtitle="Create and manage announcements"
        actions={
          <ActionButton
            label="New Announcement"
            icon={FaPlus}
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          />
        }
      />
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search announcements..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No announcements"
          description="Create your first announcement."
          actionLabel="New Announcement"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Announcement" : "New Announcement"}
        onSubmit={handleSave}
      >
        <Input
          label="Title"
          name="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <Select
          label="Target"
          name="target"
          value={form.target}
          onChange={(e) => setForm({ ...form, target: e.target.value })}
          options={[
            { value: "All", label: "All" },
            { value: "Students", label: "Students" },
            { value: "Teachers", label: "Teachers" },
            { value: "Parents", label: "Parents" },
          ]}
          required
        />
        <Input
          label="Date"
          name="date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <Textarea
          label="Content"
          name="content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          options={[
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ]}
          required
        />
      </FormModal>
      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement?"
      />
    </div>
  );
}

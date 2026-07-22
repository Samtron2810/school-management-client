import { useState } from "react";
import {
  FaUserFriends,
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
import Button from "../../components/ui/Button";

const initialParents = [
  {
    id: 1,
    name: "Mr. & Mrs. Doe",
    email: "doe@example.com",
    phone: "08012345678",
    children: 2,
    status: "active",
  },
  {
    id: 2,
    name: "Mr. & Mrs. Smith",
    email: "smith@example.com",
    phone: "08087654321",
    children: 1,
    status: "active",
  },
  {
    id: 3,
    name: "Mr. & Mrs. Johnson",
    email: "johnson@example.com",
    phone: "08033445566",
    children: 3,
    status: "inactive",
  },
];

export default function ParentManagementPage() {
  const [parents, setParents] = useState(initialParents);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    children: "",
    status: "active",
  });

  const filtered = parents.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Parent Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Children", accessor: "children" },
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
              setForm({
                name: row.name || "",
                email: row.email || "",
                phone: row.phone || "",
                children: row.children || "",
                status: row.status || "active",
              });
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
      setParents(
        parents.map((p) => (p.id === selected.id ? { ...p, ...form } : p)),
      );
    } else {
      setParents([...parents, { id: Date.now(), ...form }]);
    }
    setFormOpen(false);
    setSelected(null);
    setForm({ name: "", email: "", phone: "", children: "", status: "active" });
  };

  const handleDelete = () => {
    setParents(parents.filter((p) => p.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Parent Management"
        subtitle="Manage parent and guardian records"
        actions={
          <ActionButton
            label="Add Parent"
            icon={FaPlus}
            onClick={() => {
              setSelected(null);
              setForm({ name: "", email: "", phone: "", children: "", status: "active" });
              setFormOpen(true);
            }}
          />
        }
      />
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search parents..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No parents found"
          description="Get started by adding a new parent."
          actionLabel="Add Parent"
          onAction={() => {
            setSelected(null);
            setForm({ name: "", email: "", phone: "", children: "", status: "active" });
            setFormOpen(true);
          }}
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
        title={selected ? "Edit Parent" : "Add Parent"}
        onSubmit={handleSave}
      >
        <Input
          label="Parent Name"
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <Input
          label="Number of Children"
          name="children"
          type="number"
          value={form.children}
          onChange={(e) => setForm({ ...form, children: e.target.value })}
          required
        />
      </FormModal>
      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Parent"
        message="Are you sure you want to delete this parent record?"
      />
    </div>
  );
}

import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import announcementService from "../../services/announcementService";
import classService from "../../services/classService";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { asArray, classLabel } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Toggle from "../../components/ui/Toggle";
import CheckboxGroup from "../../components/forms/CheckboxGroup";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "teacher", label: "Teachers" },
  { value: "student", label: "Students" },
  { value: "parent", label: "Parents" },
];

const priorityOptions = [
  { value: "Low", label: "Low" },
  { value: "Normal", label: "Normal" },
  { value: "High", label: "High" },
  { value: "Urgent", label: "Urgent" },
];

const emptyForm = {
  title: "",
  message: "",
  priority: "Normal",
  targetRoles: ["admin", "teacher", "student", "parent"],
  targetClasses: [],
  publishAt: "",
  expiresAt: "",
  isPinned: false,
};

function priorityVariant(priority) {
  return (
    { Low: "default", Normal: "info", High: "warning", Urgent: "danger" }[
      priority
    ] || "default"
  );
}

export default function AnnouncementManagementPage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(announcementService.list);
  const classesApi = useApi(classService.list);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const myId = user?._id || user?.id;

  const rows = asArray(data).map((announcement) => ({
    _id: announcement._id,
    createdBy: announcement.createdBy?._id || announcement.createdBy,
    title: announcement.title,
    message: announcement.message,
    priority: announcement.priority || "Normal",
    audience:
      announcement.targetRoles?.length === 4
        ? "Everyone"
        : announcement.targetRoles?.map((role) => role).join(", ") ||
          "Everyone",
    publishAt: formatDate(announcement.publishAt),
    expiresAt: announcement.expiresAt
      ? formatDate(announcement.expiresAt)
      : "—",
    pinned: announcement.isPinned,
    __search: `${announcement.title} ${announcement.message}`.toLowerCase(),
    __doc: announcement,
  }));

  const filtered = rows.filter((row) =>
    row.__search.includes(search.toLowerCase()),
  );

  const canManage = (row) => myId && row.createdBy === myId;

  const columns = [
    {
      header: "Title",
      accessor: "title",
      render: (row) => (
        <div>
          <p className="font-medium">
            {row.pinned && <Badge variant="info">Pinned</Badge>} {row.title}
          </p>
          <p className="text-xs text-slate-gray line-clamp-1">{row.message}</p>
        </div>
      ),
    },
    {
      header: "Priority",
      accessor: "priority",
      render: (row) => (
        <Badge variant={priorityVariant(row.priority)}>{row.priority}</Badge>
      ),
    },
    { header: "Audience", accessor: "audience" },
    { header: "Published", accessor: "publishAt" },
    { header: "Expires", accessor: "expiresAt" },
    {
      header: "Actions",
      render: (row) =>
        canManage(row) ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon={FaEdit}
              title="Edit announcement"
              onClick={() => {
                setSelected(row.__doc);
                const doc = row.__doc;
                setForm({
                  title: doc.title || "",
                  message: doc.message || "",
                  priority: doc.priority || "Normal",
                  targetRoles: doc.targetRoles || [],
                  targetClasses: (doc.targetClasses || []).map(
                    (cls) => cls._id || cls,
                  ),
                  publishAt: doc.publishAt ? doc.publishAt.slice(0, 10) : "",
                  expiresAt: doc.expiresAt ? doc.expiresAt.slice(0, 10) : "",
                  isPinned: Boolean(doc.isPinned),
                });
                setFormOpen(true);
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={FaTrashAlt}
              title="Delete announcement"
              onClick={() => {
                setSelected(row.__doc);
                setDeleteOpen(true);
              }}
            />
          </div>
        ) : (
          <span className="text-xs text-slate-gray">—</span>
        ),
    },
  ];

  const buildPayload = () => ({
    title: form.title,
    message: form.message,
    priority: form.priority,
    targetRoles: form.targetRoles.length > 0 ? form.targetRoles : undefined,
    targetClasses: form.targetClasses,
    isPinned: form.isPinned,
    ...(form.publishAt ? { publishAt: form.publishAt } : {}),
    ...(form.expiresAt ? { expiresAt: form.expiresAt } : {}),
  });

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (selected) {
        await announcementService.update(selected._id, buildPayload());
        toast.success("Announcement updated");
      } else {
        await announcementService.create(buildPayload());
        toast.success("Announcement published");
      }
      setFormOpen(false);
      setSelected(null);
      setForm(emptyForm);
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await announcementService.remove(selected._id);
      toast.success("Announcement deleted");
      setDeleteOpen(false);
      setSelected(null);
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  const classOptions = asArray(classesApi.data).map((schoolClass) => ({
    value: schoolClass._id,
    label: classLabel(schoolClass),
  }));

  return (
    <>
      <ManagePage
        title="Announcements"
        subtitle="Publish announcements for staff, students, and parents"
        actionLabel="New Announcement"
        onAdd={() => {
          setSelected(null);
          setForm(emptyForm);
          setFormOpen(true);
        }}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search announcements..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No announcements yet"
        emptyDescription="Publish the first school announcement."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Announcement" : "New Announcement"}
        onSubmit={handleSubmit}
        submitLabel={selected ? "Save Changes" : "Publish"}
        loading={saving}
      >
        <Input
          label="Title"
          name="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <Textarea
          label="Message"
          name="message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={4}
          required
        />
        <Select
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
          options={priorityOptions}
        />
        <CheckboxGroup
          label="Target Roles"
          options={roleOptions}
          selectedValues={form.targetRoles}
          onChange={(values) => setForm({ ...form, targetRoles: values })}
        />
        <CheckboxGroup
          label="Restrict to Classes (optional)"
          options={classOptions}
          selectedValues={form.targetClasses}
          onChange={(values) => setForm({ ...form, targetClasses: values })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Publish At"
            name="publishAt"
            type="date"
            value={form.publishAt}
            onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
          />
          <Input
            label="Expires At"
            name="expiresAt"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
        </div>
        <Toggle
          label="Pin this announcement"
          enabled={form.isPinned}
          onChange={(enabled) => setForm({ ...form, isPinned: enabled })}
        />
      </FormModal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Delete "${selected?.title}"? This cannot be undone.`}
      />
    </>
  );
}

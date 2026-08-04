import { useState } from "react";
import toast from "react-hot-toast";

import promotionService from "../../services/promotionService";
import classService from "../../services/classService";
import sessionService from "../../services/sessionService";
import termService from "../../services/termService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel, displayName } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";

const emptyForm = {
  fromClass: "",
  toClass: "",
  targetSession: "",
  targetTerm: "",
};

export default function PromotionPage() {
  const { data, loading, error, refetch } = useApi(promotionService.list);
  const classesApi = useApi(classService.list);
  const sessionsApi = useApi(sessionService.list);
  const termsApi = useApi(termService.list);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((promotion) => {
    const results = asArray(promotion.results);
    const promoted = results.filter((r) => r.status === "Promoted").length;
    return {
      _id: promotion._id,
      fromClass: classLabel(promotion.fromClass),
      toClass: classLabel(promotion.toClass),
      route: `${promotion.sourceSession?.name || "current"} → ${promotion.targetSession?.name || "N/A"}`,
      targetTerm: promotion.targetTerm?.name || "N/A",
      processed: (
        <>
          <Badge variant="info">{results.length} processed</Badge>{" "}
          <Badge variant="success">{promoted} promoted</Badge>
        </>
      ),
      by: displayName(promotion.promotedBy) || "N/A",
      date: formatDate(promotion.createdAt),
      __search:
        `${classLabel(promotion.fromClass)} ${classLabel(promotion.toClass)}`.toLowerCase(),
    };
  });

  const filtered = rows.filter((row) =>
    row.__search.includes(search.toLowerCase()),
  );

  const classOptions = asArray(classesApi.data).map((schoolClass) => ({
    value: schoolClass._id,
    label: classLabel(schoolClass),
  }));
  const sessionOptions = asArray(sessionsApi.data).map((session) => ({
    value: session._id,
    label: session.name,
  }));
  const termOptions = asArray(termsApi.data).map((term) => ({
    value: term._id,
    label: term.name,
  }));

  const columns = [
    { header: "From", accessor: "fromClass" },
    { header: "To", accessor: "toClass" },
    { header: "Session Route", accessor: "route" },
    { header: "Target Term", accessor: "targetTerm" },
    { header: "Outcome", accessor: "processed" },
    { header: "By", accessor: "by" },
    { header: "Date", accessor: "date" },
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await promotionService.promote(form);
      toast.success("Students promoted successfully");
      setFormOpen(false);
      setForm(emptyForm);
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ManagePage
        title="Promotions"
        subtitle="Promote students between classes for a new session/term"
        actionLabel="Run Promotion"
        onAdd={() => setFormOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search promotions..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No promotions yet"
        emptyDescription="Run the first class promotion."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Run Promotion"
        onSubmit={handleSubmit}
        submitLabel="Promote"
        loading={saving}
      >
        <Select
          label="From Class"
          name="fromClass"
          value={form.fromClass}
          onChange={set("fromClass")}
          options={classOptions}
          placeholder="Select current class"
          required
        />
        <Select
          label="To Class"
          name="toClass"
          value={form.toClass}
          onChange={set("toClass")}
          options={classOptions}
          placeholder="Select new class"
          required
        />
        <Select
          label="Target Session"
          name="targetSession"
          value={form.targetSession}
          onChange={set("targetSession")}
          options={sessionOptions}
          placeholder="Select target session"
          required
        />
        <Select
          label="Target Term"
          name="targetTerm"
          value={form.targetTerm}
          onChange={set("targetTerm")}
          options={termOptions}
          placeholder="Select target term"
          required
        />
        <p className="text-xs text-slate-gray">
          All students with an active enrollment in the source class (current
          session/term) are promoted. This action runs on the server and cannot
          be undone from here.
        </p>
      </FormModal>
    </>
  );
}

import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Select from "../ui/Select";

export default function BulkActionModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount = 0,
}) {
  const [action, setAction] = useState("");

  const actions = [
    { value: "activate", label: "Activate Selected" },
    { value: "deactivate", label: "Deactivate Selected" },
    { value: "delete", label: "Delete Selected" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Action">
      <p className="text-sm text-slate-gray mb-4">
        You have selected <strong>{selectedCount}</strong> item(s). Choose an
        action to perform.
      </p>
      <Select
        label="Action"
        name="bulkAction"
        value={action}
        onChange={(e) => setAction(e.target.value)}
        options={actions}
        placeholder="Select action..."
      />
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onConfirm?.(action)} disabled={!action}>
          Apply
        </Button>
      </div>
    </Modal>
  );
}

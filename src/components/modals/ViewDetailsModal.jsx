import Modal from "../ui/Modal";

export default function ViewDetailsModal({
  isOpen,
  onClose,
  title,
  fields = [],
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index}>
            <p className="text-xs font-medium text-slate-gray uppercase tracking-wider">
              {field.label}
            </p>
            <p className="text-sm text-primary mt-1">{field.value || "-"}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}

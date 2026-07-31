import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  onSaveAndAddAnother,
  submitLabel = "Save",
  loading = false,
  maxWidth = "2xl", // forms use 2-column grids, so give them room on desktop
}) {
  const handleSubmit = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {onSaveAndAddAnother && (
            <Button type="button" variant="outline" loading={loading} onClick={onSaveAndAddAnother}>
              Save & Add Another
            </Button>
          )}
          <Button type="submit" loading={loading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


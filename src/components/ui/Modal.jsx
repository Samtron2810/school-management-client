import { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

const widthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

// Shared modal shell — every modal in the app renders through this.
// Viewport behaviour:
//  - the overlay itself scrolls, so a dialog taller than the screen can
//    never clip (previously the header slid off the top of the screen)
//  - the panel is capped at 100vh minus its margins and only the body
//    scrolls, keeping the title bar pinned while content scrolls
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}) {
  const overlayRef = useRef(null);
  const panelWidth = widthClasses[maxWidth] || widthClasses.md;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className={`relative w-full ${panelWidth} my-6 sm:my-8 bg-white rounded-xl shadow-2xl flex flex-col max-h-[calc(100vh-7rem)]`}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Header — pinned, never scrolls away */}
          <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-gray-200 shrink-0">
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-gray hover:text-primary transition-colors"
              aria-label="Close"
              title="Close"
            >
              <FaTimes />
            </button>
          </div>

          {/* Body — the only scrolling region on short screens */}
          <div className="px-5 sm:px-6 py-4 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

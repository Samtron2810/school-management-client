import { useState } from "react";
import { FaEnvelope, FaTimes } from "react-icons/fa";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

/**
 * Shows a sticky banner when the logged-in user has not yet verified their
 * email. Lets them resend the verification email without leaving the page.
 */
export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Only show for unverified users who haven't dismissed it this session
  if (!user || user.isEmailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    setError("");
    try {
      await api.post("/auth/resend-verification");
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-3 text-sm">
      <FaEnvelope className="text-amber-500 shrink-0" />

      {sent ? (
        <p className="flex-1 text-amber-800">
          Verification email sent! Check your inbox (and spam folder).
        </p>
      ) : (
        <p className="flex-1 text-amber-800">
          Your email address is not verified.{" "}
          <button
            onClick={handleResend}
            disabled={sending}
            className="font-semibold underline hover:no-underline disabled:opacity-50 cursor-pointer"
          >
            {sending ? "Sending…" : "Resend verification email"}
          </button>
          {error && <span className="ml-2 text-danger text-xs">{error}</span>}
        </p>
      )}

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 text-amber-500 hover:text-amber-700 transition-colors"
      >
        <FaTimes />
      </button>
    </div>
  );
}

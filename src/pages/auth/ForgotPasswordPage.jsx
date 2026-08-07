import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import Input from "../../components/ui/Input";
import SubmitButton from "../../components/buttons/SubmitButton";
import logo from "../../assets/logos/Tronschool-logo.png";
import authService from "../../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-light p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="TronSchool Logo" className="h-12 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary">
            <span className="text-primary">Tron</span>
            <span className="text-coral">School</span>
          </h1>
        </div>

        {sent ? (
          /* ── Success state ── */
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <FaCheckCircle className="text-green-500 text-5xl" />
            </div>
            <h2 className="text-lg font-semibold text-primary mb-2">
              Check your inbox
            </h2>
            <p className="text-sm text-slate-gray mb-6 leading-relaxed">
              If <span className="font-medium text-primary">{email}</span> is
              registered, a password reset link has been sent. Check your spam
              folder if you don't see it within a few minutes.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-coral font-medium hover:underline"
            >
              <FaArrowLeft className="text-xs" />
              Back to sign in
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <h2 className="text-lg font-semibold text-primary mb-1">
              Forgot your password?
            </h2>
            <p className="text-sm text-slate-gray mb-6">
              Enter your registered email and we'll send you a reset link.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Enter your email"
                icon={FaEnvelope}
                required
              />
              <SubmitButton label="Send Reset Link" loading={loading} />
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-slate-gray hover:text-primary transition-colors"
              >
                <FaArrowLeft className="text-xs" />
                Back to sign in
              </Link>
            </div>
          </>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4">
          <Link to="/privacy" className="text-xs text-slate-gray hover:text-coral transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-200 text-xs">|</span>
          <Link to="/terms" className="text-xs text-slate-gray hover:text-coral transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaLock, FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";
import toast from "react-hot-toast";
import Input from "../../components/ui/Input";
import SubmitButton from "../../components/buttons/SubmitButton";
import logo from "../../assets/logos/Tronschool-logo.png";
import authService from "../../services/authService";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect immediately if no token in URL
  useEffect(() => {
    if (!token) navigate("/forgot-password", { replace: true });
  }, [token, navigate]);

  const validate = () => {
    const e = {};
    if (form.newPassword.length < 8)
      e.newPassword = "Password must be at least 8 characters.";
    if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword: form.newPassword });
      toast.success("Password reset successfully. Please sign in.");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Reset link is invalid or has expired.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

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

        <h2 className="text-lg font-semibold text-primary mb-1">
          Set a new password
        </h2>
        <p className="text-sm text-slate-gray mb-6">
          Choose a strong password you haven't used before.
        </p>

        {errors.general && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-danger flex items-start gap-2">
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            <span>
              {errors.general}{" "}
              <Link to="/forgot-password" className="underline font-medium">
                Request a new link
              </Link>
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Min. 8 characters"
            icon={FaLock}
            error={errors.newPassword}
            required
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your new password"
            icon={FaLock}
            error={errors.confirmPassword}
            required
          />
          <SubmitButton label="Reset Password" loading={loading} />
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
      </div>
    </div>
  );
}

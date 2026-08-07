import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Input from "../../components/ui/Input";
import SubmitButton from "../../components/buttons/SubmitButton";
import logo from "../../assets/logos/Tronschool-logo.png";
import useAuth from "../../hooks/useAuth";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user?.role?.toLowerCase() || "admin";
      navigate(`/${role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const session = await login(form);
      const role = session?.user?.role?.toLowerCase() || "admin";
      const from = location.state?.from?.pathname;
      if (from && from !== "/login") {
        navigate(from, { replace: true });
      } else {
        navigate(`/${role}/dashboard`, { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-light p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Tronschool Logo" className="h-12 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary">
            <span className="text-primary">Tron</span>
            <span className="text-coral">School</span>
          </h1>
          <p className="text-sm text-slate-gray mt-2">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Username"
            name="email"
            type="text"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email or username"
            icon={FaEnvelope}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            icon={FaLock}
            required
          />

          <SubmitButton label="Sign In" loading={loading} />
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-xs text-coral hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <p className="text-center text-xs text-slate-gray mt-4">
          Accounts are created by the school administrator. Contact your school
          if you can't sign in.
        </p>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-4">
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

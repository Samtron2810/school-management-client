import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Input from "../../components/ui/Input";
import SubmitButton from "../../components/buttons/SubmitButton";
import logo from "../../assets/logos/Tronschool-logo.png";
import useAuth from "../../hooks/useAuth";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-light-blue p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Tronschool Logo" className="h-12 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary">
            <span className="text-primary">Tron</span>
            <span className="text-electric-blue">School</span>
          </h1>
          <p className="text-sm text-slate-gray mt-2">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-crimson">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            icon={FaEnvelope}
            required
          />
          <div className="relative">
            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={FaLock}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-slate-gray hover:text-primary transition-colors"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-royal-blue focus:ring-royal-blue/20"
              />
              <span className="text-sm text-slate-gray">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-royal-blue hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <SubmitButton label="Sign In" loading={loading} />
        </form>

        <p className="text-center text-sm text-slate-gray mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-royal-blue hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

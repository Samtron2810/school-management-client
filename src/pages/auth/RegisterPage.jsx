import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import SubmitButton from "../../components/buttons/SubmitButton";
import logo from "../../assets/logos/Tronschool-logo.png";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { value: "admin", label: "Admin" },
    { value: "teacher", label: "Teacher" },
    { value: "student", label: "Student" },
    { value: "parent", label: "Parent" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
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
          <p className="text-sm text-slate-gray mt-2">Create your account</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-crimson">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            icon={FaUser}
            required
          />
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
              placeholder="Create a password"
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
          <Select
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            options={roles}
            placeholder="Select your role"
            required
          />
          <SubmitButton label="Create Account" loading={loading} />
        </form>

        <p className="text-center text-sm text-slate-gray mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-royal-blue hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

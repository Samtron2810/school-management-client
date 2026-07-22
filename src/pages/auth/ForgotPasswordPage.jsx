import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import Input from "../../components/ui/Input";
import SubmitButton from "../../components/buttons/SubmitButton";
import logo from "../../assets/logos/Tronschool-logo.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-blue p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Tronschool Logo" className="h-12 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary">Reset Password</h1>
          <p className="text-sm text-slate-gray mt-2">
            {sent
              ? "Check your email for reset instructions"
              : "Enter your email to receive reset instructions"}
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
              Reset link sent! Please check your email.
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-royal-blue hover:underline"
            >
              <FaArrowLeft /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              icon={FaEnvelope}
              required
            />
            <SubmitButton label="Send Reset Link" loading={loading} />
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-royal-blue hover:underline"
            >
              <FaArrowLeft /> Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

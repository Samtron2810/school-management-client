import { useState } from "react";
import { Link } from "react-router-dom";
import { FaKey, FaArrowLeft } from "react-icons/fa";
import Input from "../../components/ui/Input";
import SubmitButton from "../../components/buttons/SubmitButton";
import logo from "../../assets/logos/Tronschool-logo.png";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-blue p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Tronschool Logo" className="h-12 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary">Verify OTP</h1>
          <p className="text-sm text-slate-gray mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>
        {success ? (
          <div className="text-center">
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
              Verification successful!
            </div>
            <Link
              to="/login"
              className="text-sm text-royal-blue hover:underline"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="w-12 h-14 text-center text-xl font-semibold rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue"
                />
              ))}
            </div>
            <SubmitButton label="Verify" loading={loading} />
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

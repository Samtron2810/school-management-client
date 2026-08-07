import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import logo from "../../assets/logos/Tronschool-logo.png";
import api, { unwrap } from "../../services/api";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/authService";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        await unwrap(
          api.get(`/auth/verify-email?token=${token}`, {
            skipErrorToast: true,
          }),
        );

        // If the user is logged in, refresh the AuthContext user
        // so EmailVerificationBanner re-renders and disappears.
        if (authService.getStoredToken()) {
          try {
            await refreshUser();
          } catch {
            // Ignore refresh errors.
          }
        }

        setStatus("success");
      } catch (err) {
        setStatus("error");
        setMessage(
          err?.response?.data?.message ||
            "Verification link is invalid or has expired.",
        );
      }
    };

    verifyEmail();
  }, [token, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-light p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-md p-8 text-center">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="TronSchool" className="h-10 w-auto mb-3" />
          <h1 className="text-xl font-bold text-primary">
            <span className="text-primary">Tron</span>
            <span className="text-coral">School</span>
          </h1>
        </div>

        {status === "loading" && (
          <>
            <FaSpinner className="text-4xl text-accent animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-gray">Verifying your email…</p>
          </>
        )}

        {status === "success" && (
          <>
            <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-primary mb-2">
              Email verified!
            </h2>
            <p className="text-sm text-slate-gray mb-6">
              Your email address has been verified. You can now sign in to your
              account.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2 bg-coral text-white text-sm font-medium rounded-lg hover:bg-coral/80 transition-colors"
            >
              Go to sign in
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <FaTimesCircle className="text-5xl text-danger mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-primary mb-2">
              Verification failed
            </h2>
            <p className="text-sm text-slate-gray mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block text-sm text-coral hover:underline"
            >
              Back to sign in
            </Link>
          </>
        )}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-4">
          <Link
            to="/privacy"
            className="text-xs text-slate-gray hover:text-coral transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-200 text-xs">|</span>
          <Link
            to="/terms"
            className="text-xs text-slate-gray hover:text-coral transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

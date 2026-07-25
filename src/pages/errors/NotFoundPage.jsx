import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import Button from "../../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-blue p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-md p-8 text-center">
        <FaExclamationTriangle className="text-6xl text-crimson mb-4 mx-auto" />
        <h1 className="text-3xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold text-primary mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-slate-gray mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

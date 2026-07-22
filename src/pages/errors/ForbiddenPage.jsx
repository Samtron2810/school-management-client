import { Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import Button from "../../components/ui/Button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-blue p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-md p-8 text-center">
        <FaLock className="text-6xl text-crimson mb-4 mx-auto" />
        <h1 className="text-3xl font-bold text-primary mb-2">403</h1>
        <h2 className="text-xl font-semibold text-primary mb-2">
          Access Denied
        </h2>
        <p className="text-sm text-slate-gray mb-6">
          You do not have permission to access this page.
        </p>
        <Link to="/admin/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

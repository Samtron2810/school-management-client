import { FaServer } from "react-icons/fa";
import Button from "../../components/ui/Button";

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-blue p-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-md p-8 text-center">
        <FaServer className="text-6xl text-crimson mb-4 mx-auto" />
        <h1 className="text-3xl font-bold text-primary mb-2">500</h1>
        <h2 className="text-xl font-semibold text-primary mb-2">
          Server Error
        </h2>
        <p className="text-sm text-slate-gray mb-6">
          Something went wrong on our end. Please try again later.
        </p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    </div>
  );
}

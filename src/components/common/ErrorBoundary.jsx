import { Component } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import Button from "../ui/Button";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FaExclamationTriangle className="text-5xl text-danger mb-4" />
          <h2 className="text-xl font-bold text-primary mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-gray mb-6 max-w-md">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { useCallback, useEffect, useRef, useState } from "react";

// Lightweight data-loading hook for API-backed pages.
//   const { data, loading, error, refetch } = useApi(service.list, [params]);
// API errors are already toasted globally by the axios interceptor, so pages
// only need to keep the error around for inline display.
export default function useApi(apiCall, deps = [], { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const callRef = useRef(apiCall);

  // Keep the latest apiCall without touching refs during render.
  useEffect(() => {
    callRef.current = apiCall;
  });

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callRef.current();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skip) return undefined;
    // Scheduled so state updates land outside the effect body.
    const id = setTimeout(execute, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, skip, ...deps]);

  return { data, error, loading, refetch: execute, setData };
}

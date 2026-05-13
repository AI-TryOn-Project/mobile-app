/* ───────────────────────────────────────────
   Shared hook for calling mock API services
   with loading/error states
   ─────────────────────────────────────────── */

import { useState, useCallback } from "react";

interface UseMockApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

export function useMockApi<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  options: UseMockApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        options.onError?.(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [fn, options.onSuccess, options.onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}

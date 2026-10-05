import { useEffect, useState } from 'react';
import { apiGet } from 'src/lib/api';

type State<T> = { data: T | null; loading: boolean; error: string | null; status?: number };

// Loads `path` (+ query params) through apiGet and re-fetches whenever the
// path or params change; stale responses from a superseded request are
// dropped. `path === null` skips the request (e.g. waiting on a route param).
export function useApiGet<T>(
  path: string | null,
  params: Record<string, string | number | undefined> = {},
): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: path !== null, error: null });
  const key = JSON.stringify(params);

  useEffect(() => {
    if (path === null) return;
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    apiGet<T>(path, JSON.parse(key)).then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? { data: result.data, loading: false, error: null }
          : { data: null, loading: false, error: result.error, status: result.status },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [path, key]);

  return state;
}

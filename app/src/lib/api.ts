import type { ApiErrorEnvelope } from 'src/types/auth';

// Shared plumbing for this app's same-origin `/api/tenant/*` BFF calls
// (server/index.js): every read/write returns an ActionResult instead of
// throwing, so pages only ever branch on `ok`.
export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      status?: number;
      errorCode?: string;
      fieldErrors?: Record<string, string[]>;
      details?: Record<string, unknown>;
    };

export const genericError = 'Something went wrong. Please try again.';

export async function parseErrorResponse(res: Response): Promise<{
  error: string;
  errorCode?: string;
  fieldErrors?: Record<string, string[]>;
  details?: Record<string, unknown>;
}> {
  const body = (await res.json().catch(() => null)) as ApiErrorEnvelope | null;
  return {
    error: body?.message ?? genericError,
    errorCode: body?.error_code,
    fieldErrors: body?.errors,
    details: body?.details,
  };
}

export function toQueryString(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

// GET returning the whole JSON body - callers pick `.data`/`.meta` off it
// themselves since list endpoints return the Laravel paginator envelope.
export async function apiGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<ActionResult<T>> {
  try {
    const res = await fetch(`${path}${toQueryString(params)}`);
    if (!res.ok) {
      const { error } = await parseErrorResponse(res);
      return { ok: false, error, status: res.status };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, error: genericError };
  }
}

// POST/DELETE returning the response's `data`. A FormData body goes as
// multipart (file uploads - the browser sets the boundary), anything else as
// JSON.
export async function apiSend<T>(
  path: string,
  { method = 'POST', body }: { method?: 'POST' | 'DELETE'; body?: FormData | object } = {},
): Promise<ActionResult<T>> {
  try {
    const isForm = body instanceof FormData;
    const res = await fetch(path, {
      method,
      headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, status: res.status, ...(await parseErrorResponse(res)) };
    const json = await res.json().catch(() => null);
    return { ok: true, data: (json?.data ?? json) as T };
  } catch {
    return { ok: false, error: genericError };
  }
}

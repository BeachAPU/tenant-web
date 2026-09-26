import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ApiErrorEnvelope } from 'src/types/auth';
import type {
  CreateTicketPayload,
  PaginatedResult,
  Ticket,
  TicketFilters,
  TicketNote,
  TicketOptions,
  TicketStatusHistoryEntry,
} from 'src/types/ticket';

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

type TicketsContextState = {
  options: TicketOptions | null;
  optionsLoading: boolean;
  optionsError: string | null;
  reloadOptions: () => Promise<void>;

  listTickets: (filters: TicketFilters) => Promise<ActionResult<PaginatedResult<Ticket>>>;
  getTicket: (id: number) => Promise<ActionResult<Ticket>>;
  createTicket: (payload: CreateTicketPayload) => Promise<ActionResult<Ticket>>;
  updateTicketStatus: (id: number, status: string) => Promise<ActionResult<Ticket>>;

  listNotes: (ticketId: number) => Promise<ActionResult<TicketNote[]>>;
  addNote: (ticketId: number, body: string) => Promise<ActionResult<TicketNote>>;

  getStatusHistory: (ticketId: number) => Promise<ActionResult<TicketStatusHistoryEntry[]>>;
};

const TicketsContext = createContext<TicketsContextState | undefined>(undefined);

const genericError = 'Something went wrong. Please try again.';

async function parseErrorResponse(res: Response): Promise<{ error: string; fieldErrors?: Record<string, string[]> }> {
  const body = (await res.json().catch(() => null)) as ApiErrorEnvelope | null;
  return { error: body?.message ?? genericError, fieldErrors: body?.errors };
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<TicketOptions | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const reloadOptions = async () => {
    setOptionsLoading(true);
    setOptionsError(null);
    try {
      const res = await fetch('/api/tenant/ticket-options');
      if (!res.ok) {
        const { error } = await parseErrorResponse(res);
        setOptionsError(error);
        return;
      }
      const body = await res.json();
      setOptions(body.data as TicketOptions);
    } catch {
      setOptionsError(genericError);
    } finally {
      setOptionsLoading(false);
    }
  };

  useEffect(() => {
    void reloadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listTickets = async (filters: TicketFilters): Promise<ActionResult<PaginatedResult<Ticket>>> => {
    try {
      const qs = toQueryString(filters);
      const res = await fetch(`/api/tenant/tickets${qs}`);
      if (!res.ok) {
        const { error } = await parseErrorResponse(res);
        return { ok: false, error };
      }
      const body = await res.json();
      return { ok: true, data: body as PaginatedResult<Ticket> };
    } catch {
      return { ok: false, error: genericError };
    }
  };

  const getTicket = async (id: number): Promise<ActionResult<Ticket>> => {
    try {
      const res = await fetch(`/api/tenant/tickets/${id}`);
      if (!res.ok) {
        const { error } = await parseErrorResponse(res);
        return { ok: false, error };
      }
      const body = await res.json();
      return { ok: true, data: body.data as Ticket };
    } catch {
      return { ok: false, error: genericError };
    }
  };

  const createTicket = async (payload: CreateTicketPayload): Promise<ActionResult<Ticket>> => {
    try {
      const res = await fetch('/api/tenant/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error, fieldErrors } = await parseErrorResponse(res);
        return { ok: false, error, fieldErrors };
      }
      const body = await res.json();
      return { ok: true, data: body.data as Ticket };
    } catch {
      return { ok: false, error: genericError };
    }
  };

  // The only write path exposed to components - deliberately narrow, see
  // IssueCloseReopenActions. Never sends any field beyond `status`.
  const updateTicketStatus = async (id: number, status: string): Promise<ActionResult<Ticket>> => {
    try {
      const res = await fetch(`/api/tenant/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const { error } = await parseErrorResponse(res);
        return { ok: false, error };
      }
      const body = await res.json();
      return { ok: true, data: body.data as Ticket };
    } catch {
      return { ok: false, error: genericError };
    }
  };

  const listNotes = async (ticketId: number): Promise<ActionResult<TicketNote[]>> => {
    try {
      const res = await fetch(`/api/tenant/tickets/${ticketId}/notes`);
      if (!res.ok) {
        const { error } = await parseErrorResponse(res);
        return { ok: false, error };
      }
      const body = await res.json();
      return { ok: true, data: (body.data ?? body) as TicketNote[] };
    } catch {
      return { ok: false, error: genericError };
    }
  };

  const addNote = async (ticketId: number, body: string): Promise<ActionResult<TicketNote>> => {
    try {
      const res = await fetch(`/api/tenant/tickets/${ticketId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const { error } = await parseErrorResponse(res);
        return { ok: false, error };
      }
      const responseBody = await res.json();
      return { ok: true, data: responseBody.data as TicketNote };
    } catch {
      return { ok: false, error: genericError };
    }
  };

  const getStatusHistory = async (ticketId: number): Promise<ActionResult<TicketStatusHistoryEntry[]>> => {
    try {
      const res = await fetch(`/api/tenant/tickets/${ticketId}/status-history`);
      if (!res.ok) {
        const { error } = await parseErrorResponse(res);
        return { ok: false, error };
      }
      const body = await res.json();
      return { ok: true, data: (body.data ?? body) as TicketStatusHistoryEntry[] };
    } catch {
      return { ok: false, error: genericError };
    }
  };

  return (
    <TicketsContext.Provider
      value={{
        options,
        optionsLoading,
        optionsError,
        reloadOptions,
        listTickets,
        getTicket,
        createTicket,
        updateTicketStatus,
        listNotes,
        addNote,
        getStatusHistory,
      }}
    >
      {children}
    </TicketsContext.Provider>
  );
}

export const useTickets = () => {
  const context = useContext(TicketsContext);

  if (context === undefined) throw new Error('useTickets must be used within a TicketsProvider');

  return context;
};

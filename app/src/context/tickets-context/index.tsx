import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  apiSend,
  genericError,
  parseErrorResponse,
  toQueryString,
  type ActionResult,
} from 'src/lib/api';
import type {
  CreateTicketPayload,
  PaginatedResult,
  Ticket,
  TicketFilters,
  TicketNote,
  TicketOptions,
  TicketStatusHistoryEntry,
} from 'src/types/ticket';

type TicketsContextState = {
  options: TicketOptions | null;
  optionsLoading: boolean;
  optionsError: string | null;
  reloadOptions: () => Promise<void>;

  listTickets: (filters: TicketFilters) => Promise<ActionResult<PaginatedResult<Ticket>>>;
  getTicket: (id: number) => Promise<ActionResult<Ticket>>;
  createTicket: (payload: CreateTicketPayload) => Promise<ActionResult<Ticket>>;
  confirmTicket: (id: number) => Promise<ActionResult<Ticket>>;
  reopenTicket: (id: number) => Promise<ActionResult<Ticket>>;

  listNotes: (ticketId: number) => Promise<ActionResult<TicketNote[]>>;
  addNote: (ticketId: number, body: string, photo?: File | null) => Promise<ActionResult<TicketNote>>;

  getStatusHistory: (ticketId: number) => Promise<ActionResult<TicketStatusHistoryEntry[]>>;
};

const TicketsContext = createContext<TicketsContextState | undefined>(undefined);

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

  const listTickets = async (
    filters: TicketFilters,
  ): Promise<ActionResult<PaginatedResult<Ticket>>> => {
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

  // The reporter's only write paths besides notes: once staff mark a ticket
  // resolved (stage awaiting_confirmation) they confirm it (-> closed) or
  // send it back (-> open). The API refuses any field edit from a resident.
  const confirmTicket = (id: number) =>
    apiSend<Ticket>(`/api/tenant/tickets/${id}/confirm`, { method: 'POST' });

  const reopenTicket = (id: number) =>
    apiSend<Ticket>(`/api/tenant/tickets/${id}/reopen`, { method: 'POST' });

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

  const addNote = (ticketId: number, body: string, photo?: File | null) => {
    const form = new FormData();
    form.set('body', body);
    if (photo) form.set('attachment', photo);
    return apiSend<TicketNote>(`/api/tenant/tickets/${ticketId}/notes`, { body: form });
  };

  const getStatusHistory = async (
    ticketId: number,
  ): Promise<ActionResult<TicketStatusHistoryEntry[]>> => {
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
        confirmTicket,
        reopenTicket,
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

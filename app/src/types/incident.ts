import type { TicketRef, TicketStage } from 'src/types/ticket';

// A public building incident (lift out, insects...) as everyone at the
// building sees it - `/tenant/resident/incidents*`, PublicIncidentResource
// on the API. Never carries the reporter's identity, the description, the
// photo or private notes; the reporter reads those through
// /tenant/tickets/:id (same id).
export interface PublicIncident {
  id: number;
  building: { id: number; name: string };
  // Null = the whole building.
  area: { id: number; name: string } | null;
  incident_type: TicketRef;
  incident_subtype: TicketRef | null;
  status: { key: string; label: string | null; stage: TicketStage | null };
  reported_by_role: 'resident' | 'staff';
  affected_count: number;
  is_mine: boolean;
  affected_by_me: boolean;
  // Only on the single-incident endpoint.
  public_updates?: { body: string; created_at: string }[];
  created_at: string;
  resolved_at: string | null;
  closed_at: string | null;
}

export type IncidentState = 'open' | 'closed' | 'all';

export type IncidentFilters = Partial<{
  building_id: number;
  incident_type_id: number;
  state: IncidentState;
  page: number;
}>;

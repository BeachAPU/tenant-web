// The ticket workflow runs on a status's stage, never its key (statuses
// are tenant-configurable): open -> awaiting_confirmation (staff resolved
// it) -> closed (the reporter confirmed, or it auto-closed).
export type TicketStage = 'open' | 'awaiting_confirmation' | 'closed';

export interface TicketOption {
  id: number;
  key: string;
  label: string;
  sort_order: number;
  stage?: TicketStage;
  is_default?: boolean;
  is_terminal?: boolean;
}

export interface IncidentSubtype {
  id: number;
  incident_type_id: number;
  key: string;
  label: string;
  sort_order: number;
}

export interface IncidentType {
  id: number;
  key: string;
  label: string;
  sort_order: number;
  subtypes: IncidentSubtype[];
}

export interface TicketOptions {
  categories: TicketOption[];
  statuses: TicketOption[];
  priorities: TicketOption[];
  sources: TicketOption[];
  // Active incident kinds only - what can be picked for a new incident.
  incident_types: IncidentType[];
}

export interface TicketPersonRef {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface TicketBuildingRef {
  id: number;
  name: string;
}

export interface TicketApartmentRef {
  id: number;
  door_number: string;
}

export type ReporterType = 'owner' | 'resident' | 'staff';

// `private` = a reporter/staff-only ticket (My Issues); `incident` = a public
// building incident (see src/types/incident.ts), which its reporter also
// reaches here in full.
export type TicketKind = 'private' | 'incident';

export interface TicketRef {
  id: number;
  key: string;
  label: string;
}

export interface FileMeta {
  original_name: string;
  mime_type: string;
  size: number;
}

export interface Ticket {
  id: number;
  kind: TicketKind;
  building_id: number;
  apartment_id: number | null;
  title: string;
  description: string | null;
  // Null on incidents, which are classified by incident_type instead.
  category: string | null;
  status: string;
  stage?: TicketStage | null;
  priority: string;
  source: string;
  reporter_type: ReporterType;
  created_by: TicketPersonRef;
  resolved_at: string | null;
  closed_at: string | null;
  incident_type?: TicketRef | null;
  incident_subtype?: TicketRef | null;
  area?: { id: number; name: string } | null;
  affected_count?: number;
  photo: FileMeta | null;
  building?: TicketBuildingRef;
  apartment?: TicketApartmentRef;
  created_at: string;
  updated_at: string;
}

export interface TicketNote {
  id: number;
  ticket_id: number;
  body: string;
  // A staff "public update" on an incident, also shown on its public page.
  is_public: boolean;
  author: TicketPersonRef;
  attachment: FileMeta | null;
  created_at: string;
}

export interface TicketStatusHistoryEntry {
  field: 'category' | 'status' | 'priority';
  old_value: string | null;
  new_value: string;
  // Null when the system changed it (auto-close after staff resolved it).
  changed_by: TicketPersonRef | null;
  created_at: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta?: PaginationMeta;
}

export type TicketFilters = Partial<{
  kind: TicketKind;
  status: string;
  category: string;
  priority: string;
  building_id: number;
  apartment_id: number;
  page: number;
}>;

export interface CreateTicketPayload {
  building_id: number;
  apartment_id: number | null;
  title: string;
  description?: string;
  category: string;
  priority?: string;
}

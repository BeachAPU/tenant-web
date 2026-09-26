export interface TicketOption {
  id: number;
  key: string;
  label: string;
  sort_order: number;
  is_default?: boolean;
  is_terminal?: boolean;
}

export interface TicketOptions {
  categories: TicketOption[];
  statuses: TicketOption[];
  priorities: TicketOption[];
  sources: TicketOption[];
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

export interface Ticket {
  id: number;
  building_id: number;
  apartment_id: number | null;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  source: string;
  reporter_type: ReporterType;
  created_by: TicketPersonRef;
  closed_at: string | null;
  building?: TicketBuildingRef;
  apartment?: TicketApartmentRef;
  created_at: string;
  updated_at: string;
}

export interface TicketNote {
  id: number;
  ticket_id: number;
  body: string;
  author: TicketPersonRef;
  created_at: string;
}

export interface TicketStatusHistoryEntry {
  field: 'category' | 'status' | 'priority';
  old_value: string | null;
  new_value: string;
  changed_by: TicketPersonRef;
  created_at: string;
}

export interface BuildingSummary {
  id: number;
  name: string;
  city_id: number;
  street: string;
  housenumber: string;
  external_system_id?: string | null;
  apartments_count?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApartmentSummary {
  id: number;
  building_id: number;
  door_number: string;
  floor?: string | number | null;
  useful_area_m2?: number | null;
  created_at: string;
  updated_at: string;
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

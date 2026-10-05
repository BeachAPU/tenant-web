// Owner/resident read-only shapes from the Laravel API's
// `/tenant/resident/*` group - see server/resident.js. Everything here is
// already filtered server-side to the caller's own apartment footprint.

export type ApartmentRelation = 'owner' | 'resident' | 'both';

export interface MyApartment {
  id: number;
  door_number: string;
  floor: number | null;
  useful_area_m2: number | null;
  relation: ApartmentRelation;
}

export interface BuildingArea {
  id: number;
  name: string;
  size: string | number | null;
  notes: string | null;
}

export interface ResidentBuilding {
  id: number;
  name: string;
  street: string;
  housenumber: string;
  city_name: string | null;
  postcode: string | null;
  apartments_count: number | null;
  non_residential_units_count: number | null;
  useful_area_m2: number | null;
  non_residential_area_m2: number | null;
  total_area_m2: number | null;
  my_apartments: MyApartment[];
  areas?: BuildingArea[];
}

export interface Representative {
  global_user_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
}

export interface ResidentContactCard {
  id: number;
  label: { id: number; name: string } | null;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  company_contact: string | null;
  other_contact: string | null;
}

export interface BuildingContacts {
  building_id: number;
  representatives: Representative[];
  contact_cards: ResidentContactCard[];
}

export interface MessageTarget {
  id: number;
  building_id: number;
  building_name: string | null;
  building_area_type_id: number | null;
  building_area_type_name: string | null;
  apartment_id: number | null;
  apartment_door_number: string | null;
}

export interface ResidentMessage {
  id: number;
  category_name: string | null;
  body: string;
  creator: { first_name: string | null; last_name: string | null };
  // The caller's own post - they may delete it.
  is_own: boolean;
  published_at: string;
  expires_at: string | null;
  attachment: { original_name: string; mime_type: string; size: number } | null;
  targets: MessageTarget[];
}

export type BillStatus = 'unpaid' | 'overdue' | 'paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'other';

export interface BillTarget {
  type: 'building' | 'apartment';
  building_id: number | null;
  building_name: string | null;
  apartment_id: number | null;
  door_number: string | null;
  address: string | null;
}

export interface ResidentBill {
  id: number;
  bill_number: string;
  status: BillStatus;
  target: BillTarget;
  category?: { id: number; name: string } | null;
  title: string;
  note: string | null;
  amount: string;
  currency_code: string;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  payment_method: PaymentMethod | null;
  cancelled_at: string | null;
  has_file: boolean;
}

export type BillFilters = Partial<{
  status: BillStatus;
  building_id: number;
  apartment_id: number;
  year: number;
  page: number;
}>;

export type TenantEnvironment = 'live' | 'demo';

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  role: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface ApiErrorEnvelope {
  error_code: string;
  message: string;
  errors?: Record<string, string[]>;
}

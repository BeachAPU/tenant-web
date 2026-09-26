export type TenantEnvironment = 'live' | 'demo';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  role: string;
  locale: string;
  theme?: ThemePreference;
  created_at: string;
  updated_at: string;
}

export interface ApiErrorEnvelope {
  error_code: string;
  message: string;
  errors?: Record<string, string[]>;
}

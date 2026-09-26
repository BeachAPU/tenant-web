import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from 'src/lib/utils';

// DESIGN.md §11.5: the auth pages copy admin-ui's TailAdmin login value for
// value, so they use these instead of the app's Label/Input/Alert/Button.

export const AuthLabel = ({ htmlFor, children }: { htmlFor: string; children: ReactNode }) => (
  <label htmlFor={htmlFor} className="light-auth-label mb-1.5 block text-sm font-medium">
    {children} <span className="light-auth-required">*</span>
  </label>
);

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(({ error, className, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={error || undefined}
    className={cn(
      'light-auth-input h-11 w-full appearance-none px-4 py-2.5 text-sm',
      error && 'light-auth-input-error',
      className,
    )}
    {...props}
  />
));
AuthInput.displayName = 'AuthInput';

// 12px line 6px under a field: the error when there is one, else the hint.
export const AuthHint = ({ error, children }: { error?: boolean; children: ReactNode }) => (
  <p className={cn('mt-1.5 text-xs', error ? 'light-auth-hint-error' : 'light-auth-hint')}>{children}</p>
);

export const AuthBanner = ({ kind, children }: { kind: 'error' | 'success'; children: ReactNode }) => (
  <div
    role={kind === 'error' ? 'alert' : 'status'}
    className={`light-auth-banner light-auth-banner-${kind} px-4 py-3 text-sm`}
  >
    {children}
  </div>
);

export const AuthSubmit = ({ busy, children }: { busy: boolean; children: ReactNode }) => (
  <button
    type="submit"
    disabled={busy}
    className="light-btn-primary inline-flex h-11 w-full cursor-pointer items-center justify-center px-4 py-3 text-sm font-normal text-white shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
  >
    {children}
  </button>
);

export const AuthLink = ({ to, className, children }: { to: string; className?: string; children: ReactNode }) => (
  <Link to={to} className={cn('light-auth-link text-sm', className)}>
    {children}
  </Link>
);

// "Back to sign in", 20px under the form or banner (forgot/reset views).
export const AuthBackLink = ({ children }: { children: ReactNode }) => (
  <div className="mt-5">
    <AuthLink to="/login">{children}</AuthLink>
  </div>
);

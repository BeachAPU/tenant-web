import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/context/auth-context';
import PasswordInput from './PasswordInput';
import { AuthBanner, AuthInput, AuthLabel, AuthLink, AuthSubmit } from './AuthFormParts';

const AuthLogin = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Like admin's, "Keep me logged in" is visual only: the session lifetime
  // is fixed server-side (SESSION_MAX_AGE_MINUTES).
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.ok) navigate('/', { replace: true });
    else setError(result.error);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <AuthBanner kind="error">{error}</AuthBanner>}
      <div>
        <AuthLabel htmlFor="email">{t('auth.login.emailLabel')}</AuthLabel>
        <AuthInput
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder={t('auth.login.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <AuthLabel htmlFor="userpwd">{t('auth.login.passwordLabel')}</AuthLabel>
        <PasswordInput
          id="userpwd"
          name="password"
          autoComplete="current-password"
          placeholder={t('auth.login.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-3">
          <span className="relative size-5">
            <input
              type="checkbox"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              className="light-auth-checkbox size-5 cursor-pointer appearance-none"
            />
            {keepLoggedIn && (
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                  stroke="white"
                  strokeWidth="1.94437"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className="light-auth-label text-sm font-normal">{t('auth.login.keepLoggedIn')}</span>
        </label>
        <AuthLink to="/auth/forgot-password">{t('auth.login.forgotPasswordLink')}</AuthLink>
      </div>
      <AuthSubmit busy={submitting}>{submitting ? t('auth.login.submitting') : t('auth.login.submit')}</AuthSubmit>
    </form>
  );
};

export default AuthLogin;

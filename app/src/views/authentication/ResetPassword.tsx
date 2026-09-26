import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/context/auth-context';
import AuthPageLayout from './AuthPageLayout';
import {
  AuthBackLink,
  AuthBanner,
  AuthHint,
  AuthInput,
  AuthLabel,
  AuthSubmit,
} from './authforms/AuthFormParts';

const ResetPassword = () => {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState(false);

  const missingToken = !email || !token;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMismatch(false);

    // DESIGN.md §11: a mismatch is a field error on Confirm, not a banner.
    if (password !== passwordConfirmation) {
      setMismatch(true);
      return;
    }

    setSubmitting(true);
    const result = await resetPassword({
      email,
      token,
      password,
      password_confirmation: passwordConfirmation,
    });
    setSubmitting(false);

    if (result.ok) setDone(true);
    else setError(result.error);
  };

  return (
    <AuthPageLayout
      title={t('auth.resetPassword.title')}
      subtitle={
        email
          ? t('auth.resetPassword.subtitleWithEmail', { email })
          : t('auth.resetPassword.subtitle')
      }
    >
      {missingToken ? (
        <AuthBanner kind="error">{t('auth.resetPassword.invalidToken')}</AuthBanner>
      ) : done ? (
        <AuthBanner kind="success">{t('auth.resetPassword.successMessage')}</AuthBanner>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <AuthBanner kind="error">{error}</AuthBanner>}
          <div>
            <AuthLabel htmlFor="password">{t('auth.resetPassword.passwordLabel')}</AuthLabel>
            <AuthInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
            />
            <AuthHint>{t('auth.resetPassword.requirementsHint')}</AuthHint>
          </div>
          <div>
            <AuthLabel htmlFor="passwordConfirmation">
              {t('auth.resetPassword.confirmPasswordLabel')}
            </AuthLabel>
            <AuthInput
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              error={mismatch}
              required
              disabled={submitting}
            />
            {mismatch && <AuthHint error>{t('auth.resetPassword.passwordMismatch')}</AuthHint>}
          </div>
          <AuthSubmit busy={submitting}>
            {submitting ? t('auth.resetPassword.submitting') : t('auth.resetPassword.submit')}
          </AuthSubmit>
        </form>
      )}

      <AuthBackLink>{t('auth.resetPassword.backToLogin')}</AuthBackLink>
    </AuthPageLayout>
  );
};

export default ResetPassword;

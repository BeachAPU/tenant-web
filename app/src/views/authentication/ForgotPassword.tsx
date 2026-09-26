import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/context/auth-context';
import AuthPageLayout from './AuthPageLayout';
import {
  AuthBackLink,
  AuthBanner,
  AuthInput,
  AuthLabel,
  AuthSubmit,
} from './authforms/AuthFormParts';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await forgotPassword(email);
    setSubmitting(false);

    if (result.ok) setSent(true);
    else setError(result.error);
  };

  return (
    <AuthPageLayout
      title={t('auth.forgotPassword.title')}
      subtitle={t('auth.forgotPassword.subtitle')}
    >
      {/* DESIGN.md §11: the success banner replaces the form so it can't be sent twice. */}
      {sent ? (
        <AuthBanner kind="success">{t('auth.forgotPassword.successMessage')}</AuthBanner>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <AuthBanner kind="error">{error}</AuthBanner>}
          <div>
            <AuthLabel htmlFor="email">{t('auth.forgotPassword.emailLabel')}</AuthLabel>
            <AuthInput
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder={t('auth.login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <AuthSubmit busy={submitting}>
            {submitting ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
          </AuthSubmit>
        </form>
      )}

      <AuthBackLink>{t('auth.forgotPassword.backToLogin')}</AuthBackLink>
    </AuthPageLayout>
  );
};

export default ForgotPassword;

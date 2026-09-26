import { useTranslation } from 'react-i18next';
import AuthPageLayout from '../AuthPageLayout';
import AuthLogin from '../authforms/AuthLogin';

const Login = () => {
  const { t } = useTranslation();

  return (
    <AuthPageLayout title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
      <AuthLogin />
    </AuthPageLayout>
  );
};

export default Login;

import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import ErrorImg from '/src/assets/images/backgrounds/maintenance.svg';
import { Button } from 'src/components/ui/button';

const Maintainance = () => {
  const { t } = useTranslation();

  return (
    <div className="h-screen flex items-center justify-center px-6 bg-white dark:bg-transparent">
      <div className="text-center max-w-lg mx-auto">
        <img src={ErrorImg} alt="error" className="mb-4" />
        <h1 className="light-text-navy text-4xl font-semibold mb-6">
          {t('errors.maintenance.title')}
        </h1>
        <h6 className="text-xl light-muted">{t('errors.maintenance.message')}</h6>
        <Button asChild className="w-fit mt-6 mx-auto">
          <Link to={'/'}>{t('common.goBackHome')}</Link>
        </Button>
      </div>
    </div>
  );
};

export default Maintainance;

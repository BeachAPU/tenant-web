import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/ui/button';
import ErrorImg from '/src/assets/images/backgrounds/errorimg.svg';
import { Link } from 'react-router';

const Error = () => {
  const { t } = useTranslation();

  return (
    <div className="h-screen flex items-center justify-center px-6 bg-white dark:bg-transparent">
      <div className="text-center">
        <img src={ErrorImg} alt="error" className="mb-4" width={500} />
        <h1 className="light-text-navy text-4xl font-semibold mb-6">
          {t('errors.notFound.title')}
        </h1>
        <h6 className="text-xl light-muted">{t('errors.notFound.message')}</h6>
        <Button asChild className="w-fit mt-6 mx-auto">
          <Link to={'/'}>{t('common.goBackHome')}</Link>
        </Button>
      </div>
    </div>
  );
};

export default Error;

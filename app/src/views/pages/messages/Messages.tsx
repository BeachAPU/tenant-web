import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/ui/button';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import MessageFeed from 'src/components/messages/MessageFeed';

const Messages = () => {
  const { t } = useTranslation();
  const BCrumb = [{ to: '/', title: t('nav.home') }, { title: t('nav.messages') }];

  return (
    <>
      <BreadcrumbComp title={t('nav.messages')} items={BCrumb} />
      <ComponentCard
        title={t('messages.boardTitle')}
        desc={t('messages.boardDescription')}
        headerAction={
          <Button asChild>
            <Link to="/messages/new">{t('messages.post.title')}</Link>
          </Button>
        }
      >
        <MessageFeed />
      </ComponentCard>
    </>
  );
};

export default Messages;

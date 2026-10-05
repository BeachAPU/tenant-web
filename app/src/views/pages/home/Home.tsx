import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AlertIcon, BoxCubeIcon, ChatIcon, DollarLineIcon, GroupIcon, MailIcon } from 'src/icons';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { useAuth } from 'src/context/auth-context';

// DESIGN.md §7: whole-card links on the `.light-panel` surface with a round
// `.light-icon-btn` icon.
const QUICK_LINKS = [
  {
    to: '/buildings',
    icon: BoxCubeIcon,
    titleKey: 'nav.buildings',
    descriptionKey: 'home.buildingsCardDescription',
  },
  {
    to: '/incidents',
    icon: AlertIcon,
    titleKey: 'nav.incidents',
    descriptionKey: 'home.incidentsCardDescription',
  },
  {
    to: '/issues',
    icon: ChatIcon,
    titleKey: 'nav.myIssues',
    descriptionKey: 'home.issuesCardDescription',
  },
  {
    to: '/messages',
    icon: MailIcon,
    titleKey: 'nav.messages',
    descriptionKey: 'home.messagesCardDescription',
  },
  {
    to: '/bills',
    icon: DollarLineIcon,
    titleKey: 'nav.bills',
    descriptionKey: 'home.billsCardDescription',
  },
  {
    to: '/contacts',
    icon: GroupIcon,
    titleKey: 'nav.contacts',
    descriptionKey: 'home.contactsCardDescription',
  },
];

const Home = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <>
      <BreadcrumbComp title={t('nav.home')} items={[{ title: t('nav.home') }]} />

      <div className="flex flex-col gap-6">
        <div className="light-panel rounded-2xl p-5 md:p-6">
          <h3 className="text-xl font-semibold light-text-navy mb-1">
            {t('home.welcomeTitle', { name: user?.first_name ?? '' })}
          </h3>
          <p className="text-sm light-muted">{t('home.welcomeSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="light-panel rounded-2xl p-5 md:p-6 flex items-start gap-4 transition-shadow hover:shadow-lg"
            >
              <span className="light-icon-btn flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                <link.icon className="size-5 fill-current" />
              </span>
              <span>
                <span className="block text-base font-semibold light-text-navy mb-1">
                  {t(link.titleKey)}
                </span>
                <span className="block text-sm light-muted">{t(link.descriptionKey)}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;

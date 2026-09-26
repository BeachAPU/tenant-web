import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import profileImg from 'src/assets/images/profile/user-1.jpg';
import { Badge } from 'src/components/ui/badge';
import { useAuth } from 'src/context/auth-context';

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

const UserProfile = () => {
  const { t } = useTranslation();
  const { user, environment } = useAuth();

  const BCrumb = [{ to: '/', title: t('profile.breadcrumbHome') }, { title: t('nav.userProfile') }];

  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : '—';

  return (
    <>
      <BreadcrumbComp title={t('nav.userProfile')} items={BCrumb} />
      <div className="flex flex-col gap-6">
        <ComponentCard title={t('nav.account')}>
          <div className="flex flex-col sm:flex-row items-center gap-6 rounded-xl relative w-full break-words">
            <div>
              <img src={profileImg} alt="profile" width={80} height={80} className="rounded-full" />
            </div>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-between items-center w-full">
              <div className="flex flex-col sm:text-left text-center gap-1.5">
                <h5 className="text-lg font-semibold light-text-navy">{fullName}</h5>
                <div className="flex flex-wrap items-center gap-1 md:gap-3">
                  <p className="text-sm light-muted capitalize">{user?.role ?? '—'}</p>
                  <div className="hidden h-4 w-px bg-gray-300 dark:bg-white/20 xl:block"></div>
                  <p className="text-sm light-muted">{user?.email ?? '—'}</p>
                </div>
              </div>
              <Badge variant={user?.is_active ? 'success' : 'light'}>
                {user?.is_active ? t('common.active') : t('common.inactive')}
              </Badge>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title={t('profile.accountDetails')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="text-xs light-muted mb-1">{t('profile.firstName')}</p>
              <p className="text-sm light-text-navy">{user?.first_name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs light-muted mb-1">{t('profile.lastName')}</p>
              <p className="text-sm light-text-navy">{user?.last_name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs light-muted mb-1">{t('profile.email')}</p>
              <p className="text-sm light-text-navy">{user?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs light-muted mb-1">{t('profile.role')}</p>
              <p className="text-sm light-text-navy capitalize">{user?.role ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs light-muted mb-1">{t('profile.locale')}</p>
              <p className="text-sm light-text-navy">{user?.locale ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs light-muted mb-1">{t('profile.environment')}</p>
              <p className="text-sm light-text-navy capitalize">{environment ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs light-muted mb-1">{t('profile.memberSince')}</p>
              <p className="text-sm light-text-navy">{formatDate(user?.created_at)}</p>
            </div>
            <div>
              <p className="text-xs light-muted mb-1">{t('profile.lastUpdated')}</p>
              <p className="text-sm light-text-navy">{formatDate(user?.updated_at)}</p>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default UserProfile;

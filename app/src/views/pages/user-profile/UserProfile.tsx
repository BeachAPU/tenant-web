import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import CardBox from 'src/components/shared/CardBox';
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
  const { user, environment } = useAuth();

  const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'User Profile' },
  ];

  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : '—';

  return (
    <>
      <BreadcrumbComp title="User Profile" items={BCrumb} />
      <div className="flex flex-col gap-6">
        <CardBox className="p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 rounded-xl relative w-full break-words">
            <div>
              <img
                src={profileImg}
                alt="profile"
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-between items-center w-full">
              <div className="flex flex-col sm:text-left text-center gap-1.5">
                <h5 className="card-title">{fullName}</h5>
                <div className="flex flex-wrap items-center gap-1 md:gap-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role ?? '—'}
                  </p>
                  <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email ?? '—'}</p>
                </div>
              </div>
              <Badge variant={user?.is_active ? 'success' : 'error'}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardBox>

        <CardBox className="p-6 overflow-hidden">
          <h5 className="card-title mb-6">Account Details</h5>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="text-xs text-gray-500">First Name</p>
              <p>{user?.first_name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Name</p>
              <p>{user?.last_name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p>{user?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="capitalize">{user?.role ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Locale</p>
              <p>{user?.locale ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Environment</p>
              <p className="capitalize">{environment ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Member Since</p>
              <p>{formatDate(user?.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p>{formatDate(user?.updated_at)}</p>
            </div>
          </div>
        </CardBox>
      </div>
    </>
  );
};

export default UserProfile;

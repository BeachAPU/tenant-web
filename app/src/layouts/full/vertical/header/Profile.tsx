import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import profileimg from 'src/assets/images/profile/user-1.jpg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { Button } from 'src/components/ui/button';
import { useAuth } from 'src/context/auth-context';
import { ChevronDownIcon, UserIcon } from 'src/icons';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

const Divider = ({ className }: { className: string }) => (
  <div className={`h-px bg-gray-200 dark:bg-white/10 ${className}`} />
);

// DESIGN.md §9.2: the header user menu, same entries as admin-ui's
// UserDropdown: name + email, My Profile, Theme and Language switches, Logout.
// Nothing else goes in it.
const Profile = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const name = user ? `${user.first_name} ${user.last_name}` : '';

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="light-text-navy flex shrink-0 cursor-pointer items-center gap-3">
          <span className="h-10 w-10 overflow-hidden rounded-full sm:h-11 sm:w-11">
            <img src={profileimg} alt="" className="h-full w-full object-cover" />
          </span>
          <span className="hidden text-sm font-semibold sm:block">{name}</span>
          <ChevronDownIcon
            className={`hidden size-5 transition-transform duration-200 sm:block ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="light-modal flex w-[calc(100vw-32px)] flex-col rounded-2xl border border-gray-200 p-3 shadow-[0_1px_4px_rgba(133,146,173,0.2)] dark:border-white/10 sm:w-[260px]"
      >
        <div className="px-3 pb-3 pt-1">
          <p className="light-text-navy text-sm font-semibold">{name}</p>
          <p className="light-muted truncate text-xs">{user?.email}</p>
        </div>

        <Divider className="mb-2" />

        <DropdownMenuItem asChild className="light-tab flex cursor-pointer items-center gap-3 px-3 py-2 text-sm font-semibold">
          <Link to="/user-profile">
            <UserIcon className="size-5 fill-current" />
            {t('header.myProfile')}
          </Link>
        </DropdownMenuItem>

        <Divider className="my-2" />

        <div className="flex items-center justify-between gap-3 px-3 py-1.5">
          <span className="light-text-navy text-sm font-semibold">{t('header.theme')}</span>
          <ThemeSwitcher />
        </div>
        <div className="flex items-center justify-between gap-3 px-3 py-1.5">
          <span className="light-text-navy text-sm font-semibold">{t('header.language')}</span>
          <LanguageSwitcher />
        </div>

        <Divider className="my-2" />

        <div className="pt-1">
          <Button variant="outline" className="h-10 w-full font-medium" onClick={handleLogout}>
            {t('header.logout')}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Profile;

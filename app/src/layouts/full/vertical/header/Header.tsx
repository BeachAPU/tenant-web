import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon, MoreDotIcon } from 'src/icons';
import { MenuIcon } from 'src/components/shared/AdminInlineIcons';
import { Sheet, SheetContent, SheetTitle } from 'src/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useSidebarState } from '../../SidebarState';
import SidebarLayout from '../sidebar/Sidebar';
import Logo from '../../shared/logo/Logo';
import Messages from './Messages';
import Profile from './Profile';
import Search from './Search';

// The fixed sidebar shows from xl (DESIGN.md §4.1); below that the toggle
// opens it as a drawer instead of collapsing it.
const SIDEBAR_FIXED_FROM = 1280;

// DESIGN.md §9.1: toggle on the left (+ this app's search box), notifications
// and the user menu on the right, nothing else. Below lg the right side moves
// to a second row behind the More button, and the logo mark sits centred.
const Header = () => {
  const { t } = useTranslation();
  const { toggleCollapsed, mobileOpen, setMobileOpen } = useSidebarState();
  const [actionsOpen, setActionsOpen] = useState(false);

  const handleToggle = () => {
    if (window.innerWidth >= SIDEBAR_FIXED_FROM) toggleCollapsed();
    else setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <header className="light-header sticky top-0 z-[2] flex w-full lg:border-b">
        <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
          <div className="flex w-full items-center justify-between gap-2 light-header-line border-b px-3 py-3 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
            <button
              type="button"
              onClick={handleToggle}
              aria-label={t('header.toggleSidebar')}
              className="light-text-navy flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center light-header-line rounded-lg lg:h-11 lg:w-11 lg:border"
            >
              {mobileOpen ? <CloseIcon className="size-6" /> : <MenuIcon width={16} height={12} />}
            </button>

            <div className="hidden lg:block">
              <Search />
            </div>

            <div className="lg:hidden">
              <Logo />
            </div>

            <button
              type="button"
              onClick={() => setActionsOpen((o) => !o)}
              aria-label={t('header.moreActions')}
              aria-expanded={actionsOpen}
              className="light-text-navy flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 lg:hidden"
            >
              <MoreDotIcon className="size-6 rotate-90 fill-current" />
            </button>
          </div>

          <div
            className={`${
              actionsOpen ? 'flex' : 'hidden'
            } w-full items-center justify-between gap-4 px-5 py-4 shadow-md lg:flex lg:justify-end lg:px-0 lg:shadow-none`}
          >
            <Messages />
            <Profile />
          </div>
        </div>
      </header>

      {/* Drawer sidebar below xl */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <VisuallyHidden>
            <SheetTitle>sidebar</SheetTitle>
          </VisuallyHidden>
          <SidebarLayout onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;

import SidebarContent, { type SidebarIcon } from './sidebaritems';
import SimpleBar from 'simplebar-react';
import FullLogo, { LogoMark } from '../../shared/logo/FullLogo';
import { HorizontaLDots } from 'src/icons';
import { useSidebarState } from '../../SidebarState';
import { Link, useLocation } from 'react-router';
import { useTheme } from 'src/components/provider/theme-provider';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AMLogo, AMMenu, AMMenuItem, AMSidebar, AMSubmenu } from 'tailwind-sidebar';
import 'tailwind-sidebar/styles.css';

interface SidebarItemType {
  heading?: string;
  headingKey?: string;
  id?: number | string;
  name?: string;
  nameKey?: string;
  title?: string;
  icon?: SidebarIcon;
  url?: string;
  children?: SidebarItemType[];
  disabled?: boolean;
  isPro?: boolean;
}

const renderSidebarItems = (
  items: SidebarItemType[],
  currentPath: string,
  t: TFunction,
  onClose?: () => void,
  rail = false,
) => {
  return items.map((item) => {
    const isSelected = currentPath === item?.url;
    const IconComp = item.icon;
    const label = item.nameKey ? t(item.nameKey) : item.title || item.name;

    // DESIGN.md §12: 24px nav icon in the item's text colour; items without
    // one get a small dot instead of a library glyph.
    const iconElement = IconComp ? (
      <IconComp className="size-6 fill-current" />
    ) : (
      <span className="block size-1.5 rounded-full bg-current" />
    );

    // Heading
    if (item.heading) {
      return (
        <div className="mb-1" key={item.heading}>
          {rail ? (
            // Collapsed rail: headings become dots (DESIGN.md §4.1, as in admin).
            <div className="light-text-navy flex h-8 items-center px-2.5">
              <HorizontaLDots className="size-6 fill-current" />
            </div>
          ) : (
            <AMMenu
              subHeading={item.headingKey ? t(item.headingKey) : item.heading}
              ClassName="hide-menu leading-21 light-text-navy font-normal uppercase text-xs"
            />
          )}
        </div>
      );
    }

    // Submenu
    if (item.children?.length) {
      return (
        <AMSubmenu key={item.id} icon={iconElement} title={label} ClassName="mt-0.5 light-nav-text">
          {renderSidebarItems(item.children, currentPath, t, onClose, rail)}
        </AMSubmenu>
      );
    }

    // Regular menu item
    const linkTarget = item.url?.startsWith('https') ? '_blank' : '_self';

    // DESIGN.md §5: active item = `.light-nav-active` pill, others `.light-nav-text`.
    const itemClassNames = `mt-0.5 ${isSelected ? 'light-nav-active' : 'light-nav-text'}`;

    return (
      <div key={item.id} onClick={onClose}>
        <AMMenuItem
          icon={iconElement}
          isSelected={isSelected}
          link={item.url || undefined}
          target={linkTarget}
          badge={!!item.isPro}
          badgeColor="bg-lightsecondary"
          badgeTextColor="text-secondary"
          disabled={item.disabled}
          badgeContent={item.isPro ? 'Pro' : undefined}
          component={Link}
          className={`${itemClassNames}`}
        >
          {!rail && <span className="truncate flex-1">{label}</span>}
        </AMMenuItem>
      </div>
    );
  });
};

const SidebarLayout = ({ onClose }: { onClose?: () => void }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isRail, setHovered } = useSidebarState();
  // The drawer (onClose set) is always full width; only the fixed sidebar collapses.
  const rail = !onClose && isRail;

  // Only allow "light" or "dark" for AMSidebar
  const sidebarMode = theme === 'light' || theme === 'dark' ? theme : undefined;

  return (
    <div
      onMouseEnter={onClose ? undefined : () => setHovered(true)}
      onMouseLeave={onClose ? undefined : () => setHovered(false)}
    >
    <AMSidebar
      collapsible="none"
      animation={true}
      showProfile={false}
      width={rail ? '90px' : '270px'}
      showTrigger={false}
      mode={sidebarMode}
      className="fixed left-0 top-0 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-transparent z-10 h-screen"
    >
      {/* Logo */}
      <div className="px-6 flex items-center brand-logo overflow-hidden">
        <AMLogo component={Link} href="/" img="">
          {rail ? <LogoMark width={32} height={29} className="text-[#153CAA] dark:text-white" /> : <FullLogo />}
        </AMLogo>
      </div>

      {/* Sidebar items */}

      <SimpleBar className="h-[calc(100vh-100px)]">
        <div className="px-6">
          {SidebarContent.map((section, index) => (
            <div key={index}>
              {renderSidebarItems(
                [
                  ...(section.heading
                    ? [{ heading: section.heading, headingKey: section.headingKey }]
                    : []),
                  ...(section.children || []),
                ],
                pathname,
                t,
                onClose,
                rail,
              )}
            </div>
          ))}
        </div>
      </SimpleBar>
    </AMSidebar>
    </div>
  );
};

export default SidebarLayout;

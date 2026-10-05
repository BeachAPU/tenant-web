import type { ComponentType, SVGProps } from 'react';
import {
  AlertIcon,
  BoxCubeIcon,
  ChatIcon,
  DollarLineIcon,
  GridIcon,
  GroupIcon,
  MailIcon,
} from 'src/icons';

// DESIGN.md §12: nav icons are admin's SVG components, not icon-library names,
// with the same meaning as in admin's catalogue (§12.1): Dashboard = GridIcon,
// Tickets = ChatIcon, Bills = DollarLineIcon, people = GroupIcon; Messages =
// MailIcon as in tenant-admin; Building incidents = AlertIcon (warnings).
// §12.1 has no building icon yet, so My Buildings uses BoxCubeIcon until one
// is added to the shared set.
export type SidebarIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface ChildItem {
  id?: number | string;
  name?: string;
  nameKey?: string;
  icon?: SidebarIcon;
  children?: ChildItem[];
  item?: unknown;
  url?: string;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  isPro?: boolean;
}

export interface MenuItem {
  heading?: string;
  headingKey?: string;
  name?: string;
  icon?: SidebarIcon;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: string;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  isPro?: boolean;
}

import { uniqueId } from 'lodash';

// `heading`/`name` are the English fallback (used if a key is somehow
// missing from a locale); `headingKey`/`nameKey` are what Sidebar.tsx
// actually renders through `t()` so the sidebar follows the account's
// saved language (SYSTEM.md's "UI preferences" - see FEATURES.md's
// "Language / i18n").
// DESIGN.md §4.2: one purpose group for this small resident portal. My
// profile, theme and language live in the header user menu (§9.2), so there
// is no "Account" group here.
const SidebarContent: MenuItem[] = [
  {
    heading: 'My Home',
    headingKey: 'nav.myHome',
    children: [
      {
        id: uniqueId(),
        name: 'Home',
        nameKey: 'nav.home',
        icon: GridIcon,
        url: '/',
        isPro: false,
      },
      {
        id: uniqueId(),
        name: 'My Buildings',
        nameKey: 'nav.buildings',
        icon: BoxCubeIcon,
        url: '/buildings',
        isPro: false,
      },
      {
        id: uniqueId(),
        name: 'Building Incidents',
        nameKey: 'nav.incidents',
        icon: AlertIcon,
        url: '/incidents',
        isPro: false,
      },
      {
        id: uniqueId(),
        name: 'My Issues',
        nameKey: 'nav.myIssues',
        icon: ChatIcon,
        url: '/issues',
        isPro: false,
      },
      {
        id: uniqueId(),
        name: 'Messages',
        nameKey: 'nav.messages',
        icon: MailIcon,
        url: '/messages',
        isPro: false,
      },
      {
        id: uniqueId(),
        name: 'Bills',
        nameKey: 'nav.bills',
        icon: DollarLineIcon,
        url: '/bills',
        isPro: false,
      },
      {
        id: uniqueId(),
        name: 'Contacts',
        nameKey: 'nav.contacts',
        icon: GroupIcon,
        url: '/contacts',
        isPro: false,
      },
    ],
  },
];

export default SidebarContent;

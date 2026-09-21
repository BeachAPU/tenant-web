export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: string;
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
  name?: string;
  icon?: string;
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

const SidebarContent: MenuItem[] = [
  {
    heading: 'Account',
    children: [
      {
        id: uniqueId(),
        name: 'User Profile',
        icon: 'solar:user-circle-linear',
        url: '/user-profile',
        isPro: false,
      },
      {
        id: uniqueId(),
        name: 'Settings',
        icon: 'solar:settings-linear',
        url: '/settings',
        isPro: false,
      },
    ],
  },
];

export default SidebarContent;

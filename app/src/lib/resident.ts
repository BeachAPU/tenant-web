import type { BadgeProps } from 'src/components/ui/badge';
import type { BillStatus, ResidentBuilding } from 'src/types/resident';

// DESIGN.md §5 "Bill status" - same mapping as admin-ui's BILL_STATUS_BADGE.
export const BILL_STATUS_BADGE: Record<BillStatus, BadgeProps['variant']> = {
  paid: 'success',
  unpaid: 'info',
  overdue: 'error',
  cancelled: 'light',
};

export function formatAmount(amount: string | number, currencyCode?: string): string {
  const value = Number(amount);
  if (!currencyCode) return value.toLocaleString(undefined, { minimumFractionDigits: 2 });
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(
      value,
    );
  } catch {
    return `${value.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currencyCode}`;
  }
}

// Calendar dates (bill issued/due/paid are plain `Y-m-d`) - no time part.
export function formatDay(value?: string | null): string {
  return value ? new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—';
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function buildingAddress(
  building: Pick<ResidentBuilding, 'street' | 'housenumber' | 'postcode' | 'city_name'>,
): string {
  const street = `${building.street} ${building.housenumber}`.trim();
  const city = [building.postcode, building.city_name].filter(Boolean).join(' ');
  return city ? `${city}, ${street}` : street;
}

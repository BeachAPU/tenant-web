import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import type { BillFilters, BillStatus, ResidentBuilding } from 'src/types/resident';

const ALL = 'all';
const STATUSES: BillStatus[] = ['unpaid', 'overdue', 'paid', 'cancelled'];

// Status, "where" (a whole building - which includes its apartment bills -
// or one of my apartments) and year. Changing any filter resets the page.
const BillFilterBar = ({
  buildings,
  value,
  onChange,
}: {
  buildings: ResidentBuilding[];
  value: BillFilters;
  onChange: (next: BillFilters) => void;
}) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const targetValue = value.apartment_id
    ? `a:${value.apartment_id}`
    : value.building_id
      ? `b:${value.building_id}`
      : ALL;

  const setTarget = (next: string) => {
    const [kind, id] = next.split(':');
    onChange({
      ...value,
      building_id: kind === 'b' ? Number(id) : undefined,
      apartment_id: kind === 'a' ? Number(id) : undefined,
      page: undefined,
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Select
        value={value.status ?? ALL}
        onValueChange={(status) =>
          onChange({
            ...value,
            status: status === ALL ? undefined : (status as BillStatus),
            page: undefined,
          })
        }
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder={t('bills.filters.status')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('bills.filters.statusAll')}</SelectItem>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {t(`bills.status.${status}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {buildings.length > 0 && (
        <Select value={targetValue} onValueChange={setTarget}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder={t('bills.filters.target')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('bills.filters.targetAll')}</SelectItem>
            {buildings.map((building) => [
              <SelectItem key={`b:${building.id}`} value={`b:${building.id}`}>
                {building.name}
              </SelectItem>,
              ...building.my_apartments.map((apartment) => (
                <SelectItem key={`a:${apartment.id}`} value={`a:${apartment.id}`}>
                  {building.name} · {t('bills.doorNumber', { door: apartment.door_number })}
                </SelectItem>
              )),
            ])}
          </SelectContent>
        </Select>
      )}

      <Select
        value={value.year ? String(value.year) : ALL}
        onValueChange={(year) =>
          onChange({ ...value, year: year === ALL ? undefined : Number(year), page: undefined })
        }
      >
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder={t('bills.filters.year')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('bills.filters.yearAll')}</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BillFilterBar;

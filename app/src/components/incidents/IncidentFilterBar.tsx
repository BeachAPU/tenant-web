import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import type { IncidentFilters, IncidentState } from 'src/types/incident';
import type { ResidentBuilding } from 'src/types/resident';
import type { IncidentType } from 'src/types/ticket';

const ALL = 'all';
const STATES: IncidentState[] = ['open', 'closed', 'all'];

// Open / recently closed / all, which building (only with more than one)
// and which kind. Changing any filter resets the page.
const IncidentFilterBar = ({
  buildings,
  types,
  value,
  onChange,
}: {
  buildings: ResidentBuilding[];
  types: IncidentType[];
  value: IncidentFilters;
  onChange: (next: IncidentFilters) => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Select
        value={value.state ?? 'open'}
        onValueChange={(state) =>
          onChange({ ...value, state: state as IncidentState, page: undefined })
        }
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATES.map((state) => (
            <SelectItem key={state} value={state}>
              {t(`incidents.filters.state.${state}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {buildings.length > 1 && (
        <Select
          value={value.building_id ? String(value.building_id) : ALL}
          onValueChange={(id) =>
            onChange({
              ...value,
              building_id: id === ALL ? undefined : Number(id),
              page: undefined,
            })
          }
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('incidents.filters.allBuildings')}</SelectItem>
            {buildings.map((building) => (
              <SelectItem key={building.id} value={String(building.id)}>
                {building.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={value.incident_type_id ? String(value.incident_type_id) : ALL}
        onValueChange={(id) =>
          onChange({
            ...value,
            incident_type_id: id === ALL ? undefined : Number(id),
            page: undefined,
          })
        }
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('incidents.filters.allKinds')}</SelectItem>
          {types.map((type) => (
            <SelectItem key={type.id} value={String(type.id)}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default IncidentFilterBar;

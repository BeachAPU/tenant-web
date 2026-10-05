import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { incidentArea, incidentKind } from 'src/lib/incidents';
import { formatDate } from 'src/lib/utils';
import IncidentStatusBadge from './IncidentStatusBadge';
import MeTooButton from './MeTooButton';
import type { PublicIncident } from 'src/types/incident';

// Stacked incident rows instead of a table, so the "me too" button stays in
// view at any width: the report form's "already reported here" list, and
// IncidentList below `md`.
const IncidentPickList = ({
  incidents,
  showBuilding = false,
  onChange,
}: {
  incidents: PublicIncident[];
  showBuilding?: boolean;
  onChange: (updated: PublicIncident) => void;
}) => {
  const { t } = useTranslation();

  return (
    <ul className="flex flex-col divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-white/5">
      {incidents.map((incident) => (
        <li key={incident.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2">
              <Link
                to={`/incidents/${incident.id}`}
                className="light-link-action text-sm font-semibold"
              >
                {incidentKind(incident)}
              </Link>
              <IncidentStatusBadge status={incident.status} />
            </span>
            <span className="text-xs light-muted">
              {showBuilding && `${incident.building.name} · `}
              {incidentArea(incident, t)} ·{' '}
              {t('incidents.affectedCount', { count: incident.affected_count })}
            </span>
            <span className="text-xs light-muted">
              {t(`incidents.reportedByRole.${incident.reported_by_role}`)} ·{' '}
              {formatDate(incident.created_at)}
            </span>
          </div>
          <MeTooButton incident={incident} onChange={onChange} />
        </li>
      ))}
    </ul>
  );
};

export default IncidentPickList;

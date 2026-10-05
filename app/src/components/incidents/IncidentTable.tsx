import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import { formatDate } from 'src/lib/utils';
import { incidentArea, incidentKind } from 'src/lib/incidents';
import IncidentStatusBadge from './IncidentStatusBadge';
import MeTooButton from './MeTooButton';
import type { PublicIncident } from 'src/types/incident';

// Public incidents: when, where, what, status, who reported it (a resident
// or staff - never a name) and the "me too" count/toggle.
const IncidentTable = ({
  incidents,
  showBuilding = true,
  onChange,
}: {
  incidents: PublicIncident[];
  showBuilding?: boolean;
  onChange: (updated: PublicIncident) => void;
}) => {
  const { t } = useTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('incidents.fields.kind')}</TableHead>
          <TableHead>{t('incidents.fields.location')}</TableHead>
          <TableHead>{t('incidents.fields.status')}</TableHead>
          <TableHead>{t('incidents.fields.reportedBy')}</TableHead>
          <TableHead>{t('incidents.fields.reportedOn')}</TableHead>
          <TableHead>{t('incidents.fields.affected')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incidents.map((incident) => (
          <TableRow key={incident.id}>
            <TableCell className="font-semibold">
              <Link to={`/incidents/${incident.id}`} className="light-link-action">
                {incidentKind(incident)}
              </Link>
            </TableCell>
            <TableCell>
              {showBuilding && <span className="block">{incident.building.name}</span>}
              <span className={showBuilding ? 'text-xs light-muted' : undefined}>
                {incidentArea(incident, t)}
              </span>
            </TableCell>
            <TableCell>
              <IncidentStatusBadge status={incident.status} />
            </TableCell>
            <TableCell>{t(`incidents.reportedByRole.${incident.reported_by_role}`)}</TableCell>
            <TableCell>{formatDate(incident.created_at)}</TableCell>
            <TableCell>
              <span className="flex items-center gap-3">
                <span className="light-muted" title={t('incidents.affectedCountTitle')}>
                  {incident.affected_count}
                </span>
                <MeTooButton incident={incident} onChange={onChange} />
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default IncidentTable;

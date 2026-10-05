import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import Spinner from 'src/views/spinner/Spinner';
import IncidentStatusBadge from 'src/components/incidents/IncidentStatusBadge';
import MeTooButton from 'src/components/incidents/MeTooButton';
import ResolutionActions from 'src/components/issues/ResolutionActions';
import { useTickets } from 'src/context/tickets-context';
import { apiGet, type ActionResult } from 'src/lib/api';
import { incidentArea, incidentKind } from 'src/lib/incidents';
import { formatDate } from 'src/lib/utils';
import type { PublicIncident } from 'src/types/incident';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs light-muted mb-1">{label}</p>
    <div className="text-sm light-text-navy">{children}</div>
  </div>
);

// One public incident: what everyone at the building sees, plus staff's
// public updates. Its reporter also gets "Confirm resolved" / "Still not
// fixed" here and a link to their full report (/issues/:id - description,
// photo, private thread), which shares the incident's id.
const IncidentDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const incidentId = Number(id);
  const { confirmTicket, reopenTicket } = useTickets();

  const [incident, setIncident] = useState<PublicIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    const result = await apiGet<{ data: PublicIncident }>(
      `/api/tenant/resident/incidents/${incidentId}`,
    );
    if (result.ok) setIncident(result.data.data);
    else setNotFound(true);
    return result;
  };

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setIncident(null);
    if (!Number.isInteger(incidentId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId]);

  // Confirm/reopen answer with the full ticket; this page shows the public
  // shape, so re-read it (it also picks up the new status).
  const runWorkflow =
    (action: typeof confirmTicket) => async (): Promise<ActionResult<unknown>> => {
      const result = await action(incidentId);
      if (result.ok) await load();
      return result;
    };

  const BCrumb = [
    { to: '/', title: t('nav.home') },
    { to: '/incidents', title: t('nav.incidents') },
    { title: incident ? incidentKind(incident) : '' },
  ];

  if (loading) return <Spinner />;

  if (notFound || !incident) {
    return (
      <Alert variant="lighterror">
        <AlertDescription>{t('incidents.notFound')}</AlertDescription>
      </Alert>
    );
  }

  const updates = incident.public_updates ?? [];

  return (
    <>
      <BreadcrumbComp title={incidentKind(incident)} items={BCrumb} />

      <ComponentCard
        className="mb-6"
        title={t('incidents.detailTitle')}
        headerAction={<MeTooButton incident={incident} onChange={setIncident} />}
      >
        <div className="flex flex-wrap items-center gap-2">
          <IncidentStatusBadge status={incident.status} />
          <span className="text-sm light-muted">
            {t('incidents.affectedCount', { count: incident.affected_count })}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          <Field label={t('incidents.fields.kind')}>{incidentKind(incident)}</Field>
          <Field label={t('incidents.fields.building')}>{incident.building.name}</Field>
          <Field label={t('incidents.fields.location')}>{incidentArea(incident, t)}</Field>
          <Field label={t('incidents.fields.reportedBy')}>
            {t(`incidents.reportedByRole.${incident.reported_by_role}`)}
          </Field>
          <Field label={t('incidents.fields.reportedOn')}>{formatDate(incident.created_at)}</Field>
          {incident.resolved_at && (
            <Field label={t('incidents.fields.resolvedOn')}>
              {formatDate(incident.resolved_at)}
            </Field>
          )}
          {incident.closed_at && (
            <Field label={t('incidents.fields.closedOn')}>{formatDate(incident.closed_at)}</Field>
          )}
        </div>

        {incident.is_mine && (
          <div className="flex flex-col gap-3 border-t border-gray-200 dark:border-white/5 pt-4">
            <ResolutionActions
              stage={incident.status.stage}
              isReporter
              onConfirm={runWorkflow(confirmTicket)}
              onReopen={runWorkflow(reopenTicket)}
            />
            <Link to={`/issues/${incident.id}`} className="light-link-action text-sm w-fit">
              {t('incidents.openMyReport')}
            </Link>
          </div>
        )}
      </ComponentCard>

      <ComponentCard title={t('incidents.updatesTitle')} desc={t('incidents.updatesDescription')}>
        {updates.length === 0 ? (
          <p className="text-sm light-muted">{t('incidents.updatesEmpty')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {updates.map((update, index) => (
              <li key={index} className="border-l-2 border-gray-200 dark:border-white/10 pl-4">
                <p className="text-sm light-text-navy whitespace-pre-wrap">{update.body}</p>
                <p className="text-xs light-muted">{formatDate(update.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </ComponentCard>
    </>
  );
};

export default IncidentDetail;

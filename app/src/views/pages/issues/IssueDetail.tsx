import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';
import Spinner from 'src/views/spinner/Spinner';
import { formatDate } from 'src/lib/utils';
import { useTickets } from 'src/context/tickets-context';
import { useAuth } from 'src/context/auth-context';
import IssueStatusBadge from 'src/components/issues/IssueStatusBadge';
import IssuePriorityBadge from 'src/components/issues/IssuePriorityBadge';
import ResolutionActions from 'src/components/issues/ResolutionActions';
import TicketNoteThread from 'src/components/issues/TicketNoteThread';
import StatusHistoryList from 'src/components/issues/StatusHistoryList';
import type { Ticket, TicketNote, TicketStatusHistoryEntry } from 'src/types/ticket';

const IssueDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const { user } = useAuth();
  const {
    options,
    getTicket,
    confirmTicket,
    reopenTicket,
    listNotes,
    addNote,
    getStatusHistory,
  } = useTickets();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notes, setNotes] = useState<TicketNote[]>([]);
  const [history, setHistory] = useState<TicketStatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(null);

    Promise.all([getTicket(ticketId), listNotes(ticketId), getStatusHistory(ticketId)]).then(
      ([ticketResult, notesResult, historyResult]) => {
        if (cancelled) return;
        setLoading(false);

        if (!ticketResult.ok) {
          setNotFound(true);
          return;
        }
        setTicket(ticketResult.data);
        if (notesResult.ok) setNotes(notesResult.data);
        if (historyResult.ok) setHistory(historyResult.data);
        if (!notesResult.ok) setError(notesResult.error);
      },
    );

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const handleAddNote = async (body: string, photo: File | null) => {
    const result = await addNote(ticketId, body, photo);
    if (result.ok) setNotes((current) => [...current, result.data]);
    return result;
  };

  // The workflow responses skip the reporter enrichment the show endpoint
  // adds, so re-read the ticket (and its history, which gained a row).
  const runWorkflow = (action: (id: number) => ReturnType<typeof confirmTicket>) => async () => {
    const result = await action(ticketId);
    if (result.ok) {
      const [ticketResult, historyResult] = await Promise.all([
        getTicket(ticketId),
        getStatusHistory(ticketId),
      ]);
      if (ticketResult.ok) setTicket(ticketResult.data);
      if (historyResult.ok) setHistory(historyResult.data);
    }
    return result;
  };

  const isIncident = ticket?.kind === 'incident';
  const stage = ticket?.stage ?? options?.statuses.find((s) => s.key === ticket?.status)?.stage;

  const BCrumb = [
    { to: '/', title: t('issues.breadcrumbHome') },
    isIncident
      ? { to: '/incidents', title: t('nav.incidents') }
      : { to: '/issues', title: t('nav.myIssues') },
    { title: ticket?.title ?? '' },
  ];

  if (loading) return <Spinner />;

  if (notFound || !ticket) {
    return (
      <Alert variant="lighterror">
        <AlertDescription>{t('issues.detail.notFound')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <BreadcrumbComp title={ticket.title} items={BCrumb} />

      <ComponentCard
        className="mb-6"
        title={t('issues.detail.tabDetails')}
        headerAction={
          <ResolutionActions
            stage={stage}
            isReporter={ticket.created_by.id === user?.id}
            onConfirm={runWorkflow(confirmTicket)}
            onReopen={runWorkflow(reopenTicket)}
          />
        }
      >
        {options && (
          <div className="flex items-center gap-2">
            <IssueStatusBadge statusKey={ticket.status} statuses={options.statuses} />
            <IssuePriorityBadge priorityKey={ticket.priority} priorities={options.priorities} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          <div>
            <p className="text-xs light-muted mb-1">{t('issues.detail.building')}</p>
            <p className="text-sm light-text-navy">{ticket.building?.name ?? '—'}</p>
          </div>
          {isIncident ? (
            <>
              <div>
                <p className="text-xs light-muted mb-1">{t('incidents.fields.location')}</p>
                <p className="text-sm light-text-navy">
                  {ticket.area?.name ?? t('incidents.wholeBuilding')}
                </p>
              </div>
              <div>
                <p className="text-xs light-muted mb-1">{t('incidents.fields.kind')}</p>
                <p className="text-sm light-text-navy">
                  {[ticket.incident_type?.label, ticket.incident_subtype?.label]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs light-muted mb-1">{t('issues.detail.apartment')}</p>
                <p className="text-sm light-text-navy">
                  {ticket.apartment_id === null
                    ? t('issues.detail.buildingWideNotice')
                    : (ticket.apartment?.door_number ?? '—')}
                </p>
              </div>
              <div>
                <p className="text-xs light-muted mb-1">{t('issues.detail.category')}</p>
                <p className="text-sm light-text-navy">
                  {options?.categories.find((c) => c.key === ticket.category)?.label ??
                    ticket.category ??
                    '—'}
                </p>
              </div>
            </>
          )}
          <div>
            <p className="text-xs light-muted mb-1">{t('issues.detail.reportedBy')}</p>
            <p className="text-sm light-text-navy">
              {ticket.created_by.first_name} {ticket.created_by.last_name}
            </p>
          </div>
          <div>
            <p className="text-xs light-muted mb-1">{t('issues.detail.reportedOn')}</p>
            <p className="text-sm light-text-navy">{formatDate(ticket.created_at)}</p>
          </div>
        </div>

        {ticket.description && (
          <div>
            <p className="text-xs light-muted mb-1">{t('issues.detail.description')}</p>
            <p className="text-sm light-text-navy whitespace-pre-wrap">{ticket.description}</p>
          </div>
        )}

        {ticket.photo && (
          <div>
            <p className="text-xs light-muted mb-1">{t('issues.detail.photo')}</p>
            <a
              href={`/api/tenant/tickets/${ticket.id}/photo`}
              target="_blank"
              rel="noreferrer"
              className="block w-fit"
            >
              <img
                src={`/api/tenant/tickets/${ticket.id}/photo`}
                alt={ticket.photo.original_name}
                className="max-h-64 max-w-full rounded-lg border border-gray-200 dark:border-white/5"
              />
            </a>
          </div>
        )}

        {isIncident && (
          <p className="text-sm">
            <Link to={`/incidents/${ticket.id}`} className="light-link-action">
              {t('incidents.viewPublicPage')}
            </Link>
          </p>
        )}
      </ComponentCard>

      <Tabs defaultValue="notes">
        <ComponentCard
          title={
            <TabsList>
              <TabsTrigger value="notes">{t('issues.detail.tabNotes')}</TabsTrigger>
              <TabsTrigger value="history">{t('issues.detail.tabHistory')}</TabsTrigger>
            </TabsList>
          }
        >
          <TabsContent value="notes" className="mt-0">
            {error && (
              <Alert variant="lighterror" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <TicketNoteThread ticketId={ticket.id} notes={notes} onSubmit={handleAddNote} />
          </TabsContent>
          <TabsContent value="history" className="mt-0">
            <StatusHistoryList entries={history} />
          </TabsContent>
        </ComponentCard>
      </Tabs>
    </>
  );
};

export default IssueDetail;

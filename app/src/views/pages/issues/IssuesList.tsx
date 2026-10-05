import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import { Button } from 'src/components/ui/button';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import ComponentCard from 'src/components/shared/ComponentCard';
import Pagination from 'src/components/shared/Pagination';
import { useTickets } from 'src/context/tickets-context';
import IssueFilterBar from 'src/components/issues/IssueFilterBar';
import IssueTable from 'src/components/issues/IssueTable';
import type { PaginationMeta, Ticket, TicketFilters } from 'src/types/ticket';

const IssuesList = () => {
  const { t } = useTranslation();
  const { options, optionsLoading, optionsError, listTickets } = useTickets();

  const [filters, setFilters] = useState<TicketFilters>({});
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Private tickets only - building incidents (including my own reports
    // of them) live on /incidents.
    listTickets({ ...filters, kind: 'private' }).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (result.ok) {
        setTickets(result.data.data);
        setMeta(result.data.meta);
      } else {
        setError(result.error);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const BCrumb = [{ to: '/', title: t('issues.breadcrumbHome') }, { title: t('nav.myIssues') }];

  return (
    <>
      <BreadcrumbComp title={t('nav.myIssues')} items={BCrumb} />
      <ComponentCard
        title={t('issues.allIssues')}
        headerSearch={
          options && <IssueFilterBar options={options} value={filters} onChange={setFilters} />
        }
        headerAction={
          <Button asChild>
            <Link to="/issues/new">{t('issues.newIssueButton')}</Link>
          </Button>
        }
      >
        {optionsError && (
          <Alert variant="lighterror">
            <AlertDescription>{optionsError}</AlertDescription>
          </Alert>
        )}

        {error && <p className="text-sm text-error">{error}</p>}

        {(loading || optionsLoading) && !error && (
          <p className="text-sm light-muted">{t('common.loading')}</p>
        )}

        {!loading && !optionsLoading && options && tickets.length === 0 && !error && (
          <p className="text-sm light-muted">{t('issues.emptyState')}</p>
        )}

        {!loading && options && tickets.length > 0 && (
          <IssueTable tickets={tickets} options={options} />
        )}

        {meta && meta.last_page > 1 && (
          <Pagination
            current={meta.current_page}
            total={meta.last_page}
            onChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        )}
      </ComponentCard>
    </>
  );
};

export default IssuesList;

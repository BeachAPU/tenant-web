import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Pagination from 'src/components/shared/Pagination';
import { useApiGet } from 'src/hooks/useApiGet';
import IncidentTable from './IncidentTable';
import IncidentPickList from './IncidentPickList';
import type { IncidentFilters, PublicIncident } from 'src/types/incident';
import type { PaginatedResult } from 'src/types/ticket';

const DAY_MS = 24 * 60 * 60 * 1000;

// One page of public incidents for `filters`. A "me too" toggle patches its
// row in place (the API returns the updated incident) instead of
// re-fetching the page. `closedWithinDays` keeps only incidents closed in
// that window (the API has no date filter) and shows just the first page.
const IncidentList = ({
  filters,
  onPageChange,
  showBuilding = true,
  closedWithinDays,
  emptyText,
}: {
  filters: IncidentFilters;
  onPageChange?: (page: number) => void;
  showBuilding?: boolean;
  closedWithinDays?: number;
  emptyText: string;
}) => {
  const { t } = useTranslation();
  const { data, loading, error } = useApiGet<PaginatedResult<PublicIncident>>(
    '/api/tenant/resident/incidents',
    filters,
  );
  const [rows, setRows] = useState<PublicIncident[]>([]);

  useEffect(() => {
    const since = closedWithinDays ? Date.now() - closedWithinDays * DAY_MS : null;
    setRows(
      (data?.data ?? []).filter(
        (row) => since === null || (row.closed_at && Date.parse(row.closed_at) >= since),
      ),
    );
  }, [data, closedWithinDays]);

  const replaceRow = (updated: PublicIncident) =>
    setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));

  if (error) return <p className="text-sm text-error">{error}</p>;
  if (loading || !data) return <p className="text-sm light-muted">{t('common.loading')}</p>;
  if (rows.length === 0) return <p className="text-sm light-muted">{emptyText}</p>;

  return (
    <>
      {/* Below md the table would push "me too" off-screen. */}
      <div className="hidden md:block">
        <IncidentTable incidents={rows} showBuilding={showBuilding} onChange={replaceRow} />
      </div>
      <div className="md:hidden">
        <IncidentPickList incidents={rows} showBuilding={showBuilding} onChange={replaceRow} />
      </div>
      {onPageChange && data.meta && data.meta.last_page > 1 && (
        <Pagination
          current={data.meta.current_page}
          total={data.meta.last_page}
          onChange={onPageChange}
        />
      )}
    </>
  );
};

export default IncidentList;

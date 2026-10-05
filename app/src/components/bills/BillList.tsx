import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Pagination from 'src/components/shared/Pagination';
import { useApiGet } from 'src/hooks/useApiGet';
import BillTable from './BillTable';
import type { BillFilters, ResidentBill } from 'src/types/resident';
import type { PaginatedResult } from 'src/types/ticket';

// Self-loading bill list - the /bills page passes its filter state in, the
// building detail's Bills tab pins `building_id`.
const BillList = ({
  filters,
  onPageChange,
}: {
  filters: BillFilters;
  onPageChange: (page: number) => void;
}) => {
  const { t } = useTranslation();
  const { data, loading, error } = useApiGet<PaginatedResult<ResidentBill>>(
    '/api/tenant/resident/property-bills',
    filters,
  );

  if (error) return <p className="text-sm text-error">{error}</p>;
  if (loading || !data) return <p className="text-sm light-muted">{t('common.loading')}</p>;
  if (data.data.length === 0) return <p className="text-sm light-muted">{t('bills.emptyState')}</p>;

  return (
    <>
      <BillTable bills={data.data} />
      {data.meta && data.meta.last_page > 1 && (
        <Pagination
          current={data.meta.current_page}
          total={data.meta.last_page}
          onChange={onPageChange}
        />
      )}
    </>
  );
};

// Same list with its own page state, for places without a filter bar.
export const PagedBillList = ({ filters }: { filters: BillFilters }) => {
  const [page, setPage] = useState<number | undefined>(undefined);
  return <BillList filters={{ ...filters, page }} onPageChange={setPage} />;
};

export default BillList;

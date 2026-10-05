import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import BillFilterBar from 'src/components/bills/BillFilterBar';
import BillList from 'src/components/bills/BillList';
import { useApiGet } from 'src/hooks/useApiGet';
import type { BillFilters, ResidentBuilding } from 'src/types/resident';

const BillsList = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<BillFilters>({});
  const { data: buildings } = useApiGet<{ data: ResidentBuilding[] }>(
    '/api/tenant/resident/buildings',
  );

  const BCrumb = [{ to: '/', title: t('nav.home') }, { title: t('nav.bills') }];

  return (
    <>
      <BreadcrumbComp title={t('nav.bills')} items={BCrumb} />
      {/* Three filters, so they sit above the table (ComponentCard's
          headerSearch is for a lone filter). */}
      <ComponentCard title={t('bills.listTitle')}>
        <BillFilterBar buildings={buildings?.data ?? []} value={filters} onChange={setFilters} />
        <BillList filters={filters} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
      </ComponentCard>
    </>
  );
};

export default BillsList;

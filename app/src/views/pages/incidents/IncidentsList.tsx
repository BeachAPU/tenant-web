import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import { Button } from 'src/components/ui/button';
import IncidentFilterBar from 'src/components/incidents/IncidentFilterBar';
import IncidentList from 'src/components/incidents/IncidentList';
import { useTickets } from 'src/context/tickets-context';
import { useApiGet } from 'src/hooks/useApiGet';
import type { IncidentFilters } from 'src/types/incident';
import type { ResidentBuilding } from 'src/types/resident';

// Public incidents at all of my buildings (lift out, insects...). The
// default view is "open and recent": the open ones, then those closed in
// the last RECENT_DAYS days. The API filters to my buildings.
const RECENT_DAYS = 30;

const IncidentsList = () => {
  const { t } = useTranslation();
  const { options } = useTickets();
  const [filters, setFilters] = useState<IncidentFilters>({ state: 'open' });
  const { data: buildings } = useApiGet<{ data: ResidentBuilding[] }>(
    '/api/tenant/resident/buildings',
  );

  const BCrumb = [{ to: '/', title: t('nav.home') }, { title: t('nav.incidents') }];

  return (
    <>
      <BreadcrumbComp title={t('nav.incidents')} items={BCrumb} />
      <ComponentCard
        title={t('incidents.listTitle')}
        desc={t('incidents.listDescription')}
        headerAction={
          <Button asChild>
            <Link to="/incidents/new">{t('incidents.reportButton')}</Link>
          </Button>
        }
      >
        <IncidentFilterBar
          buildings={buildings?.data ?? []}
          types={options?.incident_types ?? []}
          value={filters}
          onChange={setFilters}
        />
        <IncidentList
          filters={filters}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
          emptyText={
            filters.state === 'closed' ? t('incidents.emptyClosed') : t('incidents.emptyOpen')
          }
        />
      </ComponentCard>

      {(filters.state ?? 'open') === 'open' && (
        <ComponentCard
          className="mt-6"
          title={t('incidents.recentTitle')}
          desc={t('incidents.recentDescription', { days: RECENT_DAYS })}
        >
          <IncidentList
            filters={{
              building_id: filters.building_id,
              incident_type_id: filters.incident_type_id,
              state: 'closed',
            }}
            closedWithinDays={RECENT_DAYS}
            emptyText={t('incidents.recentEmpty')}
          />
        </ComponentCard>
      )}
    </>
  );
};

export default IncidentsList;

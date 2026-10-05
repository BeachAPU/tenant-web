import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import BuildingFacts from 'src/components/buildings/BuildingFacts';
import MyApartmentsList from 'src/components/buildings/MyApartmentsList';
import { useApiGet } from 'src/hooks/useApiGet';
import { buildingAddress } from 'src/lib/resident';
import type { ResidentBuilding } from 'src/types/resident';

const BuildingsList = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useApiGet<{ data: ResidentBuilding[] }>(
    '/api/tenant/resident/buildings',
  );

  const BCrumb = [{ to: '/', title: t('nav.home') }, { title: t('nav.buildings') }];

  return (
    <>
      <BreadcrumbComp title={t('nav.buildings')} items={BCrumb} />

      {error && <p className="text-sm text-error">{error}</p>}
      {loading && <p className="text-sm light-muted">{t('common.loading')}</p>}
      {data && data.data.length === 0 && (
        <ComponentCard title={t('buildings.listTitle')}>
          <p className="text-sm light-muted">{t('buildings.emptyState')}</p>
        </ComponentCard>
      )}

      <div className="flex flex-col gap-6">
        {data?.data.map((building) => (
          <ComponentCard
            key={building.id}
            title={building.name}
            desc={buildingAddress(building)}
            headerAction={
              <Link to={`/buildings/${building.id}`} className="light-link-action text-sm">
                {t('buildings.openDetails')}
              </Link>
            }
          >
            <div>
              <p className="text-xs light-muted mb-2">{t('buildings.myApartments')}</p>
              <MyApartmentsList apartments={building.my_apartments} />
            </div>
            <BuildingFacts building={building} />
          </ComponentCard>
        ))}
      </div>
    </>
  );
};

export default BuildingsList;

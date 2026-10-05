import { Link, useParams, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import { Button } from 'src/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';
import Spinner from 'src/views/spinner/Spinner';
import BuildingFacts from 'src/components/buildings/BuildingFacts';
import MyApartmentsList from 'src/components/buildings/MyApartmentsList';
import BuildingIncidents from 'src/components/buildings/BuildingIncidents';
import BuildingContactsPanel from 'src/components/contacts/BuildingContactsPanel';
import MessageFeed from 'src/components/messages/MessageFeed';
import { PagedBillList } from 'src/components/bills/BillList';
import { useApiGet } from 'src/hooks/useApiGet';
import { buildingAddress } from 'src/lib/resident';
import type { ResidentBuilding } from 'src/types/resident';

const TABS = ['overview', 'contacts', 'incidents', 'messages', 'bills'] as const;
type Tab = (typeof TABS)[number];

// Everything about one of my buildings on one page. The active tab lives in
// `?tab=` so a link (e.g. from Home) can open a specific section.
const BuildingDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const buildingId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab') as Tab | null;
  const tab: Tab = requested && TABS.includes(requested) ? requested : 'overview';

  const { data, loading, error } = useApiGet<{ data: ResidentBuilding }>(
    Number.isInteger(buildingId) ? `/api/tenant/resident/buildings/${buildingId}` : null,
  );
  const building = data?.data;

  const BCrumb = [
    { to: '/', title: t('nav.home') },
    { to: '/buildings', title: t('nav.buildings') },
    { title: building?.name ?? '' },
  ];

  if (loading) return <Spinner />;

  if (error || !building) {
    return (
      <Alert variant="lighterror">
        <AlertDescription>{t('buildings.notFound')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <BreadcrumbComp title={building.name} items={BCrumb} />

      <Tabs value={tab} onValueChange={(next) => setSearchParams({ tab: next }, { replace: true })}>
        <ComponentCard
          title={
            <TabsList className="flex-wrap h-auto">
              {TABS.map((key) => (
                <TabsTrigger key={key} value={key}>
                  {t(`buildings.tabs.${key}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          }
          headerAction={
            tab === 'incidents' && (
              <Button asChild>
                <Link to={`/incidents/new?building_id=${building.id}`}>
                  {t('incidents.reportButton')}
                </Link>
              </Button>
            )
          }
        >
          <TabsContent value="overview" className="mt-0 flex flex-col gap-6">
            <div>
              <p className="text-xs light-muted mb-1">{t('buildings.address')}</p>
              <p className="text-sm light-text-navy">{buildingAddress(building)}</p>
            </div>
            <div>
              <p className="text-xs light-muted mb-2">{t('buildings.myApartments')}</p>
              <MyApartmentsList apartments={building.my_apartments} />
            </div>
            <BuildingFacts building={building} />
            {building.areas && building.areas.length > 0 && (
              <div>
                <p className="text-xs light-muted mb-2">{t('buildings.commonAreas')}</p>
                <ul className="flex flex-col gap-1 text-sm light-text-navy">
                  {building.areas.map((area) => (
                    <li key={area.id}>
                      <span className="font-semibold">{area.name}</span>
                      {area.size !== null && <span className="light-muted"> · {area.size}</span>}
                      {area.notes && <span className="light-muted"> · {area.notes}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
          <TabsContent value="contacts" className="mt-0">
            <BuildingContactsPanel buildingId={building.id} />
          </TabsContent>
          <TabsContent value="incidents" className="mt-0">
            <BuildingIncidents buildingId={building.id} />
          </TabsContent>
          <TabsContent value="messages" className="mt-0">
            <MessageFeed buildingId={building.id} />
          </TabsContent>
          <TabsContent value="bills" className="mt-0">
            <PagedBillList filters={{ building_id: building.id }} />
          </TabsContent>
        </ComponentCard>
      </Tabs>
    </>
  );
};

export default BuildingDetail;

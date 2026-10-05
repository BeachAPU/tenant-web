import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import BuildingContactsPanel from 'src/components/contacts/BuildingContactsPanel';
import ContactCardTile from 'src/components/contacts/ContactCardTile';
import { useApiGet } from 'src/hooks/useApiGet';
import { buildingAddress } from 'src/lib/resident';
import type { BuildingContacts, ResidentBuilding } from 'src/types/resident';

// Representatives per building, then the tenant's shared resident-visible
// contact cards once (they have no building link, so every building's
// contacts response carries the same list - read it off the first one).
const Contacts = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useApiGet<{ data: ResidentBuilding[] }>(
    '/api/tenant/resident/buildings',
  );
  const buildings = data?.data ?? [];
  const firstId = buildings[0]?.id;
  const { data: shared } = useApiGet<{ data: BuildingContacts }>(
    firstId ? `/api/tenant/resident/buildings/${firstId}/contacts` : null,
  );
  const cards = shared?.data.contact_cards ?? [];

  const BCrumb = [{ to: '/', title: t('nav.home') }, { title: t('nav.contacts') }];

  return (
    <>
      <BreadcrumbComp title={t('nav.contacts')} items={BCrumb} />

      {error && <p className="text-sm text-error">{error}</p>}
      {loading && <p className="text-sm light-muted">{t('common.loading')}</p>}
      {data && buildings.length === 0 && (
        <ComponentCard title={t('contacts.representatives')}>
          <p className="text-sm light-muted">{t('buildings.emptyState')}</p>
        </ComponentCard>
      )}

      <div className="flex flex-col gap-6">
        {buildings.map((building) => (
          <ComponentCard key={building.id} title={building.name} desc={buildingAddress(building)}>
            <BuildingContactsPanel buildingId={building.id} hideCards />
          </ComponentCard>
        ))}

        {cards.length > 0 && (
          <ComponentCard
            title={t('contacts.usefulContacts')}
            desc={t('contacts.usefulContactsDesc')}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => (
                <ContactCardTile key={card.id} card={card} />
              ))}
            </div>
          </ComponentCard>
        )}
      </div>
    </>
  );
};

export default Contacts;

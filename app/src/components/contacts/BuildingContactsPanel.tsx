import { useTranslation } from 'react-i18next';
import { useApiGet } from 'src/hooks/useApiGet';
import RepresentativeTile from './RepresentativeTile';
import ContactCardTile from './ContactCardTile';
import type { BuildingContacts } from 'src/types/resident';

const GRID = 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3';

// One building's representatives, then (unless `hideCards`, used by the
// /contacts page which lists the shared cards only once) the tenant's
// resident-visible contact cards.
const BuildingContactsPanel = ({
  buildingId,
  hideCards = false,
}: {
  buildingId: number;
  hideCards?: boolean;
}) => {
  const { t } = useTranslation();
  const { data, loading, error } = useApiGet<{ data: BuildingContacts }>(
    `/api/tenant/resident/buildings/${buildingId}/contacts`,
  );

  if (error) return <p className="text-sm text-error">{error}</p>;
  if (loading || !data) return <p className="text-sm light-muted">{t('common.loading')}</p>;

  const { representatives, contact_cards: cards } = data.data;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold light-text-navy">{t('contacts.representatives')}</h4>
        {representatives.length === 0 ? (
          <p className="text-sm light-muted">{t('contacts.noRepresentatives')}</p>
        ) : (
          <div className={GRID}>
            {representatives.map((rep) => (
              <RepresentativeTile key={rep.global_user_id} representative={rep} />
            ))}
          </div>
        )}
      </section>

      {!hideCards && (
        <section className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold light-text-navy">{t('contacts.usefulContacts')}</h4>
          {cards.length === 0 ? (
            <p className="text-sm light-muted">{t('contacts.noContactCards')}</p>
          ) : (
            <div className={GRID}>
              {cards.map((card) => (
                <ContactCardTile key={card.id} card={card} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default BuildingContactsPanel;

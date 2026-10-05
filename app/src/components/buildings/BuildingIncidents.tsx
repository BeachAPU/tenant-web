import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import IncidentList from 'src/components/incidents/IncidentList';
import type { IncidentFilters } from 'src/types/incident';

// Public incidents at one building, newest first, open and closed alike.
// Private tickets aren't shown here - neighbours never see those.
const BuildingIncidents = ({ buildingId }: { buildingId: number }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number | undefined>(undefined);
  const filters: IncidentFilters = { building_id: buildingId, state: 'all', page };

  return (
    <IncidentList
      filters={filters}
      showBuilding={false}
      onPageChange={setPage}
      emptyText={t('buildings.incidentsEmpty')}
    />
  );
};

export default BuildingIncidents;

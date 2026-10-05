import { useTranslation } from 'react-i18next';
import type { ResidentBuilding } from 'src/types/resident';

// The manually-entered "basic info" figures - each is optional, so only
// the ones staff actually filled in are shown.
const BuildingFacts = ({ building }: { building: ResidentBuilding }) => {
  const { t } = useTranslation();
  const facts = [
    { key: 'apartmentsCount', value: building.apartments_count },
    { key: 'nonResidentialUnitsCount', value: building.non_residential_units_count },
    { key: 'usefulArea', value: building.useful_area_m2, unit: 'm²' },
    { key: 'nonResidentialArea', value: building.non_residential_area_m2, unit: 'm²' },
    { key: 'totalArea', value: building.total_area_m2, unit: 'm²' },
  ].filter((fact) => fact.value !== null && fact.value !== undefined);

  if (facts.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      {facts.map((fact) => (
        <div key={fact.key}>
          <dt className="text-xs light-muted mb-1">{t(`buildings.facts.${fact.key}`)}</dt>
          <dd className="text-sm font-semibold light-text-navy">
            {fact.value}
            {fact.unit ? ` ${fact.unit}` : ''}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default BuildingFacts;

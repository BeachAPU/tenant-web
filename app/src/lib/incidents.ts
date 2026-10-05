import type { TFunction } from 'i18next';
import type { PublicIncident } from 'src/types/incident';

// "Insect · Cockroach" - the kind, plus the optional sub-type.
export function incidentKind(incident: Pick<PublicIncident, 'incident_type' | 'incident_subtype'>) {
  return [incident.incident_type.label, incident.incident_subtype?.label]
    .filter(Boolean)
    .join(' · ');
}

// The common area, or "Whole building" when none was picked.
export function incidentArea(incident: Pick<PublicIncident, 'area'>, t: TFunction): string {
  return incident.area?.name ?? t('incidents.wholeBuilding');
}

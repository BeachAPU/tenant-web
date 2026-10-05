import { Badge } from 'src/components/ui/badge';
import { stageBadgeVariant } from 'src/components/issues/IssueStatusBadge';
import type { PublicIncident } from 'src/types/incident';

// The public shape already carries the status label and stage.
const IncidentStatusBadge = ({ status }: { status: PublicIncident['status'] }) => (
  <Badge variant={stageBadgeVariant(status.stage)}>{status.label ?? status.key}</Badge>
);

export default IncidentStatusBadge;

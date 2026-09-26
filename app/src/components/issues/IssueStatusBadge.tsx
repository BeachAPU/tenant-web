import { Badge, type BadgeProps } from 'src/components/ui/badge';
import type { TicketOption } from 'src/types/ticket';

// Keyed off the *current* known seed statuses purely as a nicer default for
// the common case - falls back to a generic, is_terminal-aware choice for
// anything a tenant renames/adds, since these are admin-configurable, never
// hardcoded assumptions the UI can rely on.
const KNOWN_VARIANTS: Record<string, BadgeProps['variant']> = {
  reported: 'lightInfo',
  triaged: 'lightInfo',
  scheduled: 'lightWarning',
  in_progress: 'warning',
  resolved: 'lightSuccess',
  closed: 'success',
};

const IssueStatusBadge = ({
  statusKey,
  statuses,
}: {
  statusKey: string;
  statuses: TicketOption[];
}) => {
  const status = statuses.find((option) => option.key === statusKey);
  const variant = KNOWN_VARIANTS[statusKey] ?? (status?.is_terminal ? 'lightSuccess' : 'gray');

  return <Badge variant={variant}>{status?.label ?? statusKey}</Badge>;
};

export default IssueStatusBadge;

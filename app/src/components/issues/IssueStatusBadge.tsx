import { Badge, type BadgeProps } from 'src/components/ui/badge';
import type { TicketOption, TicketStage } from 'src/types/ticket';

// Statuses are tenant-configurable, so the colour comes from the workflow
// stage, never the key: open = in progress, awaiting_confirmation = staff
// say it's fixed, closed = done.
const STAGE_VARIANTS: Record<TicketStage, BadgeProps['variant']> = {
  open: 'lightWarning',
  awaiting_confirmation: 'lightSuccess',
  closed: 'success',
};

export function stageBadgeVariant(stage?: TicketStage | null): BadgeProps['variant'] {
  return stage ? STAGE_VARIANTS[stage] : 'gray';
}

const IssueStatusBadge = ({
  statusKey,
  statuses,
}: {
  statusKey: string;
  statuses: TicketOption[];
}) => {
  const status = statuses.find((option) => option.key === statusKey);

  return <Badge variant={stageBadgeVariant(status?.stage)}>{status?.label ?? statusKey}</Badge>;
};

export default IssueStatusBadge;

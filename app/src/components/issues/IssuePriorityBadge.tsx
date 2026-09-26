import { Badge, type BadgeProps } from 'src/components/ui/badge';
import type { TicketOption } from 'src/types/ticket';

const KNOWN_VARIANTS: Record<string, BadgeProps['variant']> = {
  critical: 'error',
  high: 'lightError',
  medium: 'lightWarning',
  low: 'lightPrimary',
};

const IssuePriorityBadge = ({
  priorityKey,
  priorities,
}: {
  priorityKey: string;
  priorities: TicketOption[];
}) => {
  const priority = priorities.find((option) => option.key === priorityKey);
  const variant = KNOWN_VARIANTS[priorityKey] ?? 'gray';

  return <Badge variant={variant}>{priority?.label ?? priorityKey}</Badge>;
};

export default IssuePriorityBadge;

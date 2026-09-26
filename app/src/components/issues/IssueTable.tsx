import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Badge } from 'src/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import { formatDate } from 'src/lib/utils';
import IssueStatusBadge from './IssueStatusBadge';
import IssuePriorityBadge from './IssuePriorityBadge';
import type { Ticket, TicketOptions } from 'src/types/ticket';

const IssueTable = ({ tickets, options }: { tickets: Ticket[]; options: TicketOptions }) => {
  const { t } = useTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('issues.table.title')}</TableHead>
          <TableHead>{t('issues.table.building')}</TableHead>
          <TableHead>{t('issues.table.apartment')}</TableHead>
          <TableHead>{t('issues.table.status')}</TableHead>
          <TableHead>{t('issues.table.priority')}</TableHead>
          <TableHead>{t('issues.table.category')}</TableHead>
          <TableHead>{t('issues.table.createdAt')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell className="font-semibold">
              <Link to={`/issues/${ticket.id}`} className="light-link-action">
                {ticket.title}
              </Link>
            </TableCell>
            <TableCell>{ticket.building?.name ?? '—'}</TableCell>
            <TableCell>
              {ticket.apartment_id === null ? (
                <Badge variant="lightPrimary">{t('issues.table.buildingWide')}</Badge>
              ) : (
                (ticket.apartment?.door_number ?? '—')
              )}
            </TableCell>
            <TableCell>
              <IssueStatusBadge statusKey={ticket.status} statuses={options.statuses} />
            </TableCell>
            <TableCell>
              <IssuePriorityBadge priorityKey={ticket.priority} priorities={options.priorities} />
            </TableCell>
            <TableCell>
              {options.categories.find((c) => c.key === ticket.category)?.label ?? ticket.category}
            </TableCell>
            <TableCell>{formatDate(ticket.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default IssueTable;

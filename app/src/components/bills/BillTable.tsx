import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import { formatAmount, formatDay } from 'src/lib/resident';
import BillStatusBadge from './BillStatusBadge';
import type { ResidentBill } from 'src/types/resident';

// "Target" is always shown - an owner with several apartments must be able
// to tell bills apart (TENANT-WEB-UI "My bills").
const BillTable = ({ bills }: { bills: ResidentBill[] }) => {
  const { t } = useTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('bills.table.title')}</TableHead>
          <TableHead>{t('bills.table.target')}</TableHead>
          <TableHead>{t('bills.table.amount')}</TableHead>
          <TableHead>{t('bills.table.dueAt')}</TableHead>
          <TableHead>{t('bills.table.status')}</TableHead>
          <TableHead>{t('bills.table.file')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills.map((bill) => (
          <TableRow key={bill.id}>
            <TableCell>
              <Link to={`/bills/${bill.id}`} className="light-link-action font-semibold">
                {bill.title}
              </Link>
              <span className="block text-xs light-muted">{bill.bill_number}</span>
            </TableCell>
            <TableCell>
              {bill.target.building_name ?? '—'}
              <span className="block text-xs light-muted">
                {bill.target.type === 'apartment'
                  ? t('bills.doorNumber', { door: bill.target.door_number })
                  : t('bills.wholeBuilding')}
              </span>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {formatAmount(bill.amount, bill.currency_code)}
            </TableCell>
            <TableCell className="whitespace-nowrap">{formatDay(bill.due_at)}</TableCell>
            <TableCell>
              <BillStatusBadge status={bill.status} />
            </TableCell>
            <TableCell>
              {bill.has_file ? (
                <a
                  href={`/api/tenant/resident/property-bills/${bill.id}/file`}
                  className="light-link-action"
                >
                  {t('common.download')}
                </a>
              ) : (
                <span className="light-muted">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BillTable;

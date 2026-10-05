import { useTranslation } from 'react-i18next';
import { Badge } from 'src/components/ui/badge';
import { BILL_STATUS_BADGE } from 'src/lib/resident';
import type { BillStatus } from 'src/types/resident';

const BillStatusBadge = ({ status }: { status: BillStatus }) => {
  const { t } = useTranslation();
  return <Badge variant={BILL_STATUS_BADGE[status]}>{t(`bills.status.${status}`)}</Badge>;
};

export default BillStatusBadge;

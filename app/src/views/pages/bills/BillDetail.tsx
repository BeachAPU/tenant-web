import type { ReactNode } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import { Button } from 'src/components/ui/button';
import Spinner from 'src/views/spinner/Spinner';
import BillStatusBadge from 'src/components/bills/BillStatusBadge';
import { useApiGet } from 'src/hooks/useApiGet';
import { formatAmount, formatDay } from 'src/lib/resident';
import type { ResidentBill } from 'src/types/resident';

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <p className="text-xs light-muted mb-1">{label}</p>
    <div className="text-sm light-text-navy">{children}</div>
  </div>
);

const BillDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const billId = Number(id);
  const { data, loading, error } = useApiGet<{ data: ResidentBill }>(
    Number.isInteger(billId) ? `/api/tenant/resident/property-bills/${billId}` : null,
  );
  const bill = data?.data;

  const BCrumb = [
    { to: '/', title: t('nav.home') },
    { to: '/bills', title: t('nav.bills') },
    { title: bill?.bill_number ?? '' },
  ];

  if (loading) return <Spinner />;

  if (error || !bill) {
    return (
      <Alert variant="lighterror">
        <AlertDescription>{t('bills.notFound')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <BreadcrumbComp title={bill.title} items={BCrumb} />
      <ComponentCard
        title={t('bills.detailTitle')}
        headerAction={
          bill.has_file && (
            <Button asChild variant="outline">
              <a href={`/api/tenant/resident/property-bills/${bill.id}/file`}>
                {t('bills.downloadFile')}
              </a>
            </Button>
          )
        }
      >
        <div className="flex items-center gap-2">
          <BillStatusBadge status={bill.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7">
          <Field label={t('bills.fields.billNumber')}>{bill.bill_number}</Field>
          <Field label={t('bills.fields.amount')}>
            <span className="font-semibold">{formatAmount(bill.amount, bill.currency_code)}</span>
          </Field>
          <Field label={t('bills.fields.target')}>
            {bill.target.building_name ?? '—'}
            {' · '}
            {bill.target.type === 'apartment'
              ? t('bills.doorNumber', { door: bill.target.door_number })
              : t('bills.wholeBuilding')}
            {bill.target.address && (
              <span className="block text-xs light-muted">{bill.target.address}</span>
            )}
          </Field>
          <Field label={t('bills.fields.category')}>{bill.category?.name ?? '—'}</Field>
          <Field label={t('bills.fields.issuedAt')}>{formatDay(bill.issued_at)}</Field>
          <Field label={t('bills.fields.dueAt')}>{formatDay(bill.due_at)}</Field>
          {bill.paid_at && (
            <Field label={t('bills.fields.paidAt')}>
              {formatDay(bill.paid_at)}
              {bill.payment_method && ` · ${t(`bills.paymentMethod.${bill.payment_method}`)}`}
            </Field>
          )}
          {bill.cancelled_at && (
            <Field label={t('bills.fields.cancelledAt')}>{formatDay(bill.cancelled_at)}</Field>
          )}
        </div>

        {bill.note && (
          <Field label={t('bills.fields.note')}>
            <p className="whitespace-pre-wrap">{bill.note}</p>
          </Field>
        )}
      </ComponentCard>
    </>
  );
};

export default BillDetail;

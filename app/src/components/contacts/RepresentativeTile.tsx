import { useTranslation } from 'react-i18next';
import { Badge } from 'src/components/ui/badge';
import ContactLines from './ContactLines';
import type { Representative } from 'src/types/resident';

const RepresentativeTile = ({ representative }: { representative: Representative }) => {
  const { t } = useTranslation();
  const name =
    [representative.first_name, representative.last_name].filter(Boolean).join(' ') || '—';

  return (
    <div className="rounded-xl border border-border p-4 flex flex-col gap-2 min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold light-text-navy">{name}</span>
        <Badge variant="lightPrimary">{t('contacts.representative')}</Badge>
      </div>
      <ContactLines phone={representative.phone} email={representative.email} />
      {representative.message && (
        <p className="text-sm light-muted whitespace-pre-wrap">{representative.message}</p>
      )}
    </div>
  );
};

export default RepresentativeTile;

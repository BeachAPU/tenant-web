import { useTranslation } from 'react-i18next';
import { formatDate } from 'src/lib/utils';
import type { TicketStatusHistoryEntry } from 'src/types/ticket';

const StatusHistoryList = ({ entries }: { entries: TicketStatusHistoryEntry[] }) => {
  const { t } = useTranslation();

  if (entries.length === 0) {
    return <p className="text-sm light-muted">{t('issues.detail.historyEmpty')}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry, index) => (
        <li key={index} className="border-l-2 border-gray-200 dark:border-white/10 pl-4">
          <p className="text-sm light-text-navy">
            {t('issues.detail.historyEntry', {
              field: entry.field,
              oldValue: entry.old_value ?? '—',
              newValue: entry.new_value,
            })}
          </p>
          <p className="text-xs light-muted">
            {entry.changed_by
              ? `${entry.changed_by.first_name} ${entry.changed_by.last_name}`
              : t('issues.detail.historySystem')}{' '}
            ·{' '}
            {formatDate(entry.created_at)}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default StatusHistoryList;

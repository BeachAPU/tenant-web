import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import type { TicketFilters, TicketOptions } from 'src/types/ticket';

const ALL_STATUSES = 'all';

const IssueFilterBar = ({
  options,
  value,
  onChange,
}: {
  options: TicketOptions;
  value: TicketFilters;
  onChange: (next: TicketFilters) => void;
}) => {
  const { t } = useTranslation();

  return (
    <Select
      value={value.status ?? ALL_STATUSES}
      onValueChange={(status) =>
        onChange({
          ...value,
          status: status === ALL_STATUSES ? undefined : status,
          page: undefined,
        })
      }
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t('issues.filters.statusLabel')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_STATUSES}>{t('issues.filters.statusAll')}</SelectItem>
        {options.statuses.map((status) => (
          <SelectItem key={status.key} value={status.key}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default IssueFilterBar;

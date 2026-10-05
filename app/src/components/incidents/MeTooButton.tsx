import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { apiSend } from 'src/lib/api';
import type { PublicIncident } from 'src/types/incident';

// "Me too" toggle on someone else's incident - the reporter already counts,
// and a closed incident can't be joined (report it again instead). The API
// answers with the updated public incident, handed back via onChange.
const MeTooButton = ({
  incident,
  onChange,
}: {
  incident: PublicIncident;
  onChange: (updated: PublicIncident) => void;
}) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (incident.is_mine) return <Badge variant="lightPrimary">{t('incidents.yourReport')}</Badge>;
  if (incident.closed_at) return null;

  const toggle = async () => {
    setSubmitting(true);
    setError(null);
    const result = await apiSend<PublicIncident>(
      `/api/tenant/resident/incidents/${incident.id}/affected`,
      { method: incident.affected_by_me ? 'DELETE' : 'POST' },
    );
    setSubmitting(false);
    if (result.ok) onChange(result.data);
    else setError(result.error);
  };

  return (
    <span className="inline-flex flex-col gap-1">
      <Button
        type="button"
        size="sm"
        variant={incident.affected_by_me ? 'outline' : 'primary'}
        disabled={submitting}
        aria-pressed={incident.affected_by_me}
        title={incident.affected_by_me ? t('incidents.meTooUndo') : undefined}
        onClick={toggle}
      >
        {incident.affected_by_me ? t('incidents.meTooActive') : t('incidents.meToo')}
      </Button>
      {error && <span className="text-xs text-error">{error}</span>}
    </span>
  );
};

export default MeTooButton;

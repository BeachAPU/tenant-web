import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/ui/button';
import { Textarea } from 'src/components/ui/textarea';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import { formatDate } from 'src/lib/utils';
import type { TicketNote } from 'src/types/ticket';

type ActionResult = { ok: true } | { ok: false; error: string };

const TicketNoteThread = ({
  notes,
  onSubmit,
}: {
  notes: TicketNote[];
  onSubmit: (body: string) => Promise<ActionResult>;
}) => {
  const { t } = useTranslation();
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await onSubmit(body.trim());
    setSubmitting(false);

    if (result.ok) setBody('');
    else setError(result.error);
  };

  return (
    <div className="flex flex-col gap-4">
      {notes.length === 0 ? (
        <p className="text-sm light-muted">{t('issues.detail.notesEmpty')}</p>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="rounded-xl border border-gray-200 dark:border-white/5 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold light-text-navy">
                {note.author.first_name} {note.author.last_name}
              </span>
              <span className="text-xs light-muted">{formatDate(note.created_at)}</span>
            </div>
            <p className="text-sm light-text-navy whitespace-pre-wrap">{note.body}</p>
          </div>
        ))
      )}

      {error && (
        <Alert variant="lighterror">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('issues.detail.noteBodyPlaceholder')}
          rows={3}
        />
        <Button
          type="button"
          className="w-fit"
          disabled={submitting || !body.trim()}
          onClick={handleSubmit}
        >
          {submitting ? t('issues.detail.posting') : t('issues.detail.postNote')}
        </Button>
      </div>
    </div>
  );
};

export default TicketNoteThread;

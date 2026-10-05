import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileIcon } from 'src/icons';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Textarea } from 'src/components/ui/textarea';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import PhotoInput from 'src/components/shared/PhotoInput';
import { formatDate } from 'src/lib/utils';
import { formatSize } from 'src/lib/resident';
import type { ActionResult } from 'src/lib/api';
import type { TicketNote } from 'src/types/ticket';

// The API's note attachment limit.
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

const NoteAttachment = ({ ticketId, note }: { ticketId: number; note: TicketNote }) => {
  if (!note.attachment) return null;
  const href = `/api/tenant/tickets/${ticketId}/notes/${note.id}/attachment`;

  // Photos are shown inline; anything else staff attached is a download link.
  if (note.attachment.mime_type.startsWith('image/')) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="mt-2 block w-fit">
        <img
          src={href}
          alt={note.attachment.original_name}
          className="max-h-48 max-w-full rounded-lg border border-gray-200 dark:border-white/5"
        />
      </a>
    );
  }

  return (
    <a
      href={href}
      className="light-link-action mt-2 text-sm inline-flex items-center gap-2 min-w-0 max-w-full"
    >
      <FileIcon className="size-4 shrink-0 fill-current" />
      <span className="truncate">{note.attachment.original_name}</span>
      <span className="light-muted shrink-0">({formatSize(note.attachment.size)})</span>
    </a>
  );
};

const TicketNoteThread = ({
  ticketId,
  notes,
  onSubmit,
}: {
  ticketId: number;
  notes: TicketNote[];
  onSubmit: (body: string, photo: File | null) => Promise<ActionResult<unknown>>;
}) => {
  const { t } = useTranslation();
  const [body, setBody] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await onSubmit(body.trim(), photo);
    setSubmitting(false);

    if (result.ok) {
      setBody('');
      setPhoto(null);
    } else {
      setError(result.fieldErrors?.attachment?.[0] ?? result.error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {notes.length === 0 ? (
        <p className="text-sm light-muted">{t('issues.detail.notesEmpty')}</p>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="rounded-xl border border-gray-200 dark:border-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <span className="flex items-center gap-2 text-sm font-semibold light-text-navy">
                {note.author.first_name} {note.author.last_name}
                {note.is_public && (
                  <Badge variant="lightInfo">{t('issues.detail.publicUpdate')}</Badge>
                )}
              </span>
              <span className="text-xs light-muted">{formatDate(note.created_at)}</span>
            </div>
            <p className="text-sm light-text-navy whitespace-pre-wrap">{note.body}</p>
            <NoteAttachment ticketId={ticketId} note={note} />
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PhotoInput
            value={photo}
            onChange={setPhoto}
            maxBytes={MAX_ATTACHMENT_BYTES}
            disabled={submitting}
          />
          <Button type="button" disabled={submitting || !body.trim()} onClick={handleSubmit}>
            {submitting ? t('issues.detail.posting') : t('issues.detail.postNote')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketNoteThread;

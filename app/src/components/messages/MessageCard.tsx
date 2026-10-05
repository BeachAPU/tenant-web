import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { useConfirm } from 'src/components/shared/ConfirmDialog';
import { apiSend } from 'src/lib/api';
import { FileIcon } from 'src/icons';
import { formatDate } from 'src/lib/utils';
import { formatSize } from 'src/lib/resident';
import type { MessageTarget, ResidentMessage } from 'src/types/resident';

function targetLabel(target: MessageTarget, doorLabel: (door: string) => string): string {
  const building = target.building_name ?? '';
  if (target.apartment_door_number)
    return `${building} · ${doorLabel(target.apartment_door_number)}`;
  if (target.building_area_type_name) return `${building} · ${target.building_area_type_name}`;
  return building;
}

const MessageCard = ({
  message,
  onDeleted,
}: {
  message: ResidentMessage;
  onDeleted?: () => void;
}) => {
  const { t } = useTranslation();
  const [confirm, confirmDialog] = useConfirm();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const remove = async () => {
    if (!(await confirm(t('messages.deleteConfirm')))) return;
    const result = await apiSend(`/api/tenant/resident/messages/${message.id}`, { method: 'DELETE' });
    if (result.ok) onDeleted?.();
    else setDeleteError(result.error);
  };
  const author = [message.creator.first_name, message.creator.last_name].filter(Boolean).join(' ');

  return (
    <article className="rounded-xl border border-border p-4 md:p-5 flex flex-col gap-3">
      <header className="flex flex-wrap items-center gap-2 text-xs light-muted">
        {message.category_name && <Badge variant="lightPrimary">{message.category_name}</Badge>}
        <span>{formatDate(message.published_at)}</span>
        {author && <span>· {author}</span>}
        {message.is_own && (
          <Button variant="outline" size="sm" className="ml-auto" onClick={remove}>
            {t('common.delete')}
          </Button>
        )}
      </header>
      {deleteError && <p className="text-xs text-error">{deleteError}</p>}
      {confirmDialog}

      <p className="text-sm light-text-navy whitespace-pre-wrap break-words">{message.body}</p>

      <footer className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {message.targets.map((target) => (
            <Badge key={target.id} variant="gray">
              {targetLabel(target, (door) => t('bills.doorNumber', { door }))}
            </Badge>
          ))}
        </div>
        {message.attachment && (
          <a
            href={`/api/tenant/resident/messages/${message.id}/download`}
            className="light-link-action text-sm inline-flex items-center gap-2 min-w-0"
          >
            <FileIcon className="size-4 shrink-0 fill-current" />
            <span className="truncate">{message.attachment.original_name}</span>
            <span className="light-muted shrink-0">({formatSize(message.attachment.size)})</span>
          </a>
        )}
      </footer>
    </article>
  );
};

export default MessageCard;

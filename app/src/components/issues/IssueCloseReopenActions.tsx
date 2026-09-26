import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import type { Ticket, TicketOption } from 'src/types/ticket';

type ActionResult = { ok: true } | { ok: false; error: string };
type PendingAction = 'close' | 'reopen' | null;

// Derives the resident-appropriate action set purely from ticket-options
// metadata (is_terminal/is_default/sort_order) - never hardcoded status-key
// strings, since these are per-tenant admin-configurable. The backend
// itself places no restriction on which status a caller may set; this
// narrower "confirm fix & close" / "reopen" interaction is enforced here,
// client-side, on purpose - triaging/scheduling/progressing a ticket
// through its earlier workflow stages is staff's job, not the reporter's.
const IssueCloseReopenActions = ({
  ticket,
  statuses,
  onUpdateStatus,
}: {
  ticket: Ticket;
  statuses: TicketOption[];
  onUpdateStatus: (status: string) => Promise<ActionResult>;
}) => {
  const { t } = useTranslation();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const terminal = [...statuses]
    .filter((s) => s.is_terminal)
    .sort((a, b) => a.sort_order - b.sort_order);
  const closedStatus = terminal[terminal.length - 1] ?? null;
  const resolvedLikeKeys = new Set(terminal.slice(0, -1).map((s) => s.key));
  const reopenTarget = statuses.find((s) => s.is_default) ?? null;

  if (!closedStatus || !reopenTarget) return null;

  const runAction = async (targetStatus: TicketOption) => {
    setSubmitting(true);
    setError(null);
    const result = await onUpdateStatus(targetStatus.key);
    setSubmitting(false);
    if (result.ok) setPendingAction(null);
    else setError(result.error);
  };

  const closeDialog = () => {
    if (!submitting) {
      setPendingAction(null);
      setError(null);
    }
  };

  const actions = [];
  if (resolvedLikeKeys.has(ticket.status)) {
    actions.push(
      <Button key="close" onClick={() => setPendingAction('close')}>
        {t('issues.detail.confirmCloseButton')}
      </Button>,
      <Button key="reopen" variant="outline" onClick={() => setPendingAction('reopen')}>
        {t('issues.detail.reopenButton')}
      </Button>,
    );
  } else if (ticket.status === closedStatus.key) {
    actions.push(
      <Button key="reopen" variant="outline" onClick={() => setPendingAction('reopen')}>
        {t('issues.detail.reopenButton')}
      </Button>,
    );
  }

  return (
    <>
      {actions.length > 0 ? (
        <div className="flex gap-2">{actions}</div>
      ) : (
        <p className="text-sm light-muted">{t('issues.detail.actionPendingNotice')}</p>
      )}

      <Dialog open={pendingAction !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {pendingAction === 'close'
                ? t('issues.detail.confirmCloseDialogTitle')
                : t('issues.detail.reopenDialogTitle')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm light-text-navy">
            {pendingAction === 'close'
              ? t('issues.detail.confirmCloseDialogBody')
              : t('issues.detail.reopenDialogBody')}
          </p>
          {error && (
            <Alert variant="lighterror">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter className="flex gap-2 mt-4 sm:justify-end">
            <Button variant="outline" disabled={submitting} onClick={closeDialog}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={submitting}
              onClick={() => runAction(pendingAction === 'close' ? closedStatus : reopenTarget)}
            >
              {pendingAction === 'close'
                ? t('issues.detail.confirmCloseButton')
                : t('issues.detail.reopenButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IssueCloseReopenActions;

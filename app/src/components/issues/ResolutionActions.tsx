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
import type { ActionResult } from 'src/lib/api';
import type { TicketStage } from 'src/types/ticket';

type PendingAction = 'confirm' | 'reopen' | null;

// The reporter's side of the ticket workflow (private tickets and their own
// incidents alike): once staff mark it resolved (stage
// awaiting_confirmation) they either confirm it (-> closed) or say it's
// still not fixed (-> back to open). Driven by stage, never status keys.
// Anyone who isn't the reporter only gets the status text.
const ResolutionActions = ({
  stage,
  isReporter,
  onConfirm,
  onReopen,
}: {
  stage: TicketStage | null | undefined;
  isReporter: boolean;
  onConfirm: () => Promise<ActionResult<unknown>>;
  onReopen: () => Promise<ActionResult<unknown>>;
}) => {
  const { t } = useTranslation();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setSubmitting(true);
    setError(null);
    const result = await (pendingAction === 'confirm' ? onConfirm() : onReopen());
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

  if (stage === 'open') {
    return <p className="text-sm light-muted">{t('issues.detail.actionPendingNotice')}</p>;
  }
  if (stage !== 'awaiting_confirmation') return null;
  if (!isReporter) {
    return <p className="text-sm light-muted">{t('issues.detail.resolvedNotice')}</p>;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setPendingAction('confirm')}>
          {t('issues.detail.confirmResolvedButton')}
        </Button>
        <Button variant="outline" onClick={() => setPendingAction('reopen')}>
          {t('issues.detail.stillNotFixedButton')}
        </Button>
      </div>

      <Dialog open={pendingAction !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {pendingAction === 'confirm'
                ? t('issues.detail.confirmResolvedDialogTitle')
                : t('issues.detail.stillNotFixedDialogTitle')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm light-text-navy">
            {pendingAction === 'confirm'
              ? t('issues.detail.confirmResolvedDialogBody')
              : t('issues.detail.stillNotFixedDialogBody')}
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
            <Button disabled={submitting} onClick={run}>
              {pendingAction === 'confirm'
                ? t('issues.detail.confirmResolvedButton')
                : t('issues.detail.stillNotFixedButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResolutionActions;

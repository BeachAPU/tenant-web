import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from 'src/components/ui/dialog';

interface ConfirmOptions {
  confirmLabel?: string;
}

// DESIGN.md §6 confirm-delete modal (max-w-sm, Cancel outline + Delete danger),
// as a drop-in for window.confirm:
//   const [confirm, confirmDialog] = useConfirm();
//   if (!(await confirm(message))) return;
//   ...render {confirmDialog} somewhere in the component.
export function useConfirm() {
  const { t } = useTranslation();
  const [state, setState] = useState<{ message: string; confirmLabel?: string } | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((message: string, options: ConfirmOptions = {}) => {
    resolver.current?.(false);
    setState({ message, confirmLabel: options.confirmLabel });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setState(null);
  };

  const dialog = (
    <Dialog open={state !== null} onOpenChange={(open) => !open && settle(false)}>
      <DialogContent className="max-w-sm">
        <DialogTitle className="sr-only">{state?.confirmLabel ?? t('common.delete')}</DialogTitle>
        <p className="pr-6 text-sm light-text-navy">{state?.message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => settle(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={() => settle(true)}>
            {state?.confirmLabel ?? t('common.delete')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return [confirm, dialog] as const;
}

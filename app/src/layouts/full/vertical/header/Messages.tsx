import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { BellIcon } from 'src/components/shared/AdminInlineIcons';
import { CloseIcon } from 'src/icons';

// DESIGN.md §9.3: round 44px `.light-icon-btn` bell; the panel shares the
// user menu's surface - title row with a close (×), then items or the muted
// empty state. There's no notifications API yet, so it's always empty.
const Messages = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('header.notifications')}
          className="light-icon-btn relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full"
        >
          <BellIcon className="size-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="light-modal flex w-[calc(100vw-32px)] flex-col rounded-2xl border border-gray-200 p-3 shadow-[0_1px_4px_rgba(133,146,173,0.2)] dark:border-white/10 sm:w-[361px]"
      >
        <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-white/10">
          <h5 className="light-text-navy text-lg font-semibold">{t('header.notifications')}</h5>
          <button
            type="button"
            aria-label={t('header.close')}
            onClick={() => setOpen(false)}
            className="light-link-action cursor-pointer"
          >
            <CloseIcon className="size-6" />
          </button>
        </div>
        <p className="light-muted py-6 text-center text-sm">{t('header.noNotifications')}</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Messages;

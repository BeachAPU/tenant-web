import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { BellIcon } from 'src/components/shared/AdminInlineIcons';
import { CloseIcon } from 'src/icons';
import { apiGet } from 'src/lib/api';
import { formatDate } from 'src/lib/utils';

type TicketNotificationData = {
  ticket_id?: number;
  kind?: 'private' | 'incident';
  title?: string;
  awaiting_your_confirmation?: boolean;
};

type AppNotification = {
  id: string;
  type: string;
  data: TicketNotificationData;
  read_at: string | null;
  created_at: string;
};

type Feed = { data: AppNotification[]; unread_count: number };

// A resolved report asks its reporter to confirm it; for anyone else who
// pressed "me too" it's just news. Incidents open on their public page
// (which carries the reporter's confirm buttons too), private tickets on
// the issue page.
function describe(n: AppNotification, t: (key: string) => string) {
  const { ticket_id, kind, awaiting_your_confirmation } = n.data;
  if (!n.type.endsWith('TicketResolvedNotification') || !ticket_id) return null;
  return {
    text: awaiting_your_confirmation
      ? t('header.notificationResolvedMine')
      : t('header.notificationResolvedAffected'),
    to: kind === 'incident' ? `/incidents/${ticket_id}` : `/issues/${ticket_id}`,
  };
}

// DESIGN.md §9.3: round 44px `.light-icon-btn` bell; the panel shares the
// user menu's surface - title row with a close (×), then items or the muted
// empty state. The feed is the caller's own (/tenant/notifications); it's
// read on mount (for the unread dot) and again whenever the panel opens.
const Messages = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [feed, setFeed] = useState<Feed | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet<Feed>('/api/tenant/notifications').then((result) => {
      if (!cancelled && result.ok) setFeed(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const items = (feed?.data ?? []).flatMap((n) => {
    const view = describe(n, t);
    return view ? [{ n, view }] : [];
  });

  const openItem = (n: AppNotification, to: string) => {
    setOpen(false);
    if (!n.read_at) {
      void fetch(`/api/tenant/notifications/${n.id}/read`, { method: 'PATCH' });
      setFeed((current) =>
        current && {
          data: current.data.map((x) =>
            x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x,
          ),
          unread_count: Math.max(0, current.unread_count - 1),
        },
      );
    }
    navigate(to);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('header.notifications')}
          className="light-icon-btn relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full"
        >
          <BellIcon className="size-5" />
          {!!feed?.unread_count && (
            <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-error" />
          )}
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
        {items.length === 0 ? (
          <p className="light-muted py-6 text-center text-sm">{t('header.noNotifications')}</p>
        ) : (
          <ul className="flex max-h-96 flex-col overflow-y-auto">
            {items.map(({ n, view }) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => openItem(n, view.to)}
                  className="flex w-full cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold light-text-navy">
                    {!n.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-error" />}
                    {n.data.title}
                  </span>
                  <span className="text-sm light-muted">{view.text}</span>
                  <span className="text-xs light-muted">{formatDate(n.created_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Messages;

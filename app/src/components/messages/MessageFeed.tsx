import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Pagination from 'src/components/shared/Pagination';
import { useApiGet } from 'src/hooks/useApiGet';
import MessageCard from './MessageCard';
import type { ResidentMessage } from 'src/types/resident';
import type { PaginatedResult } from 'src/types/ticket';

// The building message board (staff and owners/residents post) -
// optionally narrowed to one building for the building detail's tab. The
// caller's own posts can be deleted in place.
const MessageFeed = ({ buildingId }: { buildingId?: number }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number | undefined>(undefined);
  const [removed, setRemoved] = useState<number[]>([]);
  const { data, loading, error } = useApiGet<PaginatedResult<ResidentMessage>>(
    '/api/tenant/resident/messages',
    { building_id: buildingId, page },
  );

  if (error) return <p className="text-sm text-error">{error}</p>;
  if (loading || !data) return <p className="text-sm light-muted">{t('common.loading')}</p>;
  const messages = data.data.filter((message) => !removed.includes(message.id));
  if (messages.length === 0) {
    return <p className="text-sm light-muted">{t('messages.emptyState')}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          onDeleted={() => setRemoved((ids) => [...ids, message.id])}
        />
      ))}
      {data.meta && data.meta.last_page > 1 && (
        <Pagination
          current={data.meta.current_page}
          total={data.meta.last_page}
          onChange={setPage}
        />
      )}
    </div>
  );
};

export default MessageFeed;

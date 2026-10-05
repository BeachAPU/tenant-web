import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import { useApiGet } from 'src/hooks/useApiGet';
import { apiSend } from 'src/lib/api';
import type { ResidentBuilding, ResidentMessage } from 'src/types/resident';

// Radix Select can't hold an empty value, so the scope is encoded as
// 'whole' / 'area:<id>' / 'apt:<id>'.
const WHOLE_BUILDING = 'whole';
// The API's message attachment limit.
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

interface TargetDraft {
  key: number;
  buildingId: number | null;
  scope: string;
}

let nextKey = 0;
const newTarget = (buildingId: number | null = null): TargetDraft => ({
  key: nextKey++,
  buildingId,
  scope: WHOLE_BUILDING,
});

// One recipient: one of the caller's own buildings, then the whole building,
// one of its common areas or one of the caller's own apartments there - the
// API refuses anything outside that footprint.
const TargetRow = ({
  draft,
  buildings,
  onChange,
  onRemove,
}: {
  draft: TargetDraft;
  buildings: ResidentBuilding[];
  onChange: (draft: TargetDraft) => void;
  onRemove?: () => void;
}) => {
  const { t } = useTranslation();
  const { data: detail } = useApiGet<{ data: ResidentBuilding }>(
    draft.buildingId ? `/api/tenant/resident/buildings/${draft.buildingId}` : null,
  );
  const building = detail?.data.id === draft.buildingId ? detail.data : null;
  const areas = building?.areas ?? [];
  const apartments = building?.my_apartments ?? [];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
      <Select
        value={draft.buildingId ? String(draft.buildingId) : undefined}
        onValueChange={(value) => onChange({ ...draft, buildingId: Number(value), scope: WHOLE_BUILDING })}
      >
        <SelectTrigger className="w-full" aria-label={t('messages.post.building')}>
          <SelectValue placeholder={t('messages.post.buildingPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {buildings.map((b) => (
            <SelectItem key={b.id} value={String(b.id)}>
              {b.name} — {b.street} {b.housenumber}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={draft.scope}
        disabled={!draft.buildingId}
        onValueChange={(value) => onChange({ ...draft, scope: value })}
      >
        <SelectTrigger className="w-full" aria-label={t('messages.post.scope')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={WHOLE_BUILDING}>{t('messages.post.wholeBuilding')}</SelectItem>
          {areas.length > 0 && (
            <SelectGroup>
              <SelectLabel>{t('messages.post.commonAreas')}</SelectLabel>
              {areas.map((area) => (
                <SelectItem key={`area-${area.id}`} value={`area:${area.id}`}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          {apartments.length > 0 && (
            <SelectGroup>
              <SelectLabel>{t('messages.post.myApartments')}</SelectLabel>
              {apartments.map((apartment) => (
                <SelectItem key={`apt-${apartment.id}`} value={`apt:${apartment.id}`}>
                  {t('bills.doorNumber', { door: apartment.door_number })}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>

      {onRemove ? (
        <Button type="button" variant="outline" onClick={onRemove}>
          {t('messages.post.removeTarget')}
        </Button>
      ) : (
        <span />
      )}
    </div>
  );
};

const PostMessage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: buildings } = useApiGet<{ data: ResidentBuilding[] }>(
    '/api/tenant/resident/buildings',
  );
  const { data: categories } = useApiGet<{ data: { id: number; label: string }[] }>(
    '/api/tenant/resident/message-categories',
  );

  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [targets, setTargets] = useState<TargetDraft[]>([newTarget()]);
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // A resident with a single building doesn't have to pick it.
  useEffect(() => {
    if (buildings?.data.length === 1) {
      setTargets((rows) =>
        rows.map((row) => (row.buildingId === null ? { ...row, buildingId: buildings.data[0].id } : row)),
      );
    }
  }, [buildings]);

  const fieldError = (key: string) =>
    fieldErrors[key]?.[0] ? <p className="text-xs text-error">{fieldErrors[key][0]}</p> : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId || targets.some((row) => !row.buildingId)) return;

    if (attachment && attachment.size > MAX_ATTACHMENT_BYTES) {
      setError(t('messages.post.attachmentTooLarge'));
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const form = new FormData();
    form.set('message_category_id', categoryId);
    form.set('body', body.trim());
    targets.forEach((row, index) => {
      form.set(`targets[${index}][building_id]`, String(row.buildingId));
      const [kind, id] = row.scope.split(':');
      if (kind === 'area') form.set(`targets[${index}][building_area_type_id]`, id);
      if (kind === 'apt') form.set(`targets[${index}][apartment_id]`, id);
    });
    if (attachment) form.set('attachment', attachment);

    const result = await apiSend<ResidentMessage>('/api/tenant/resident/messages', { body: form });

    setSubmitting(false);
    if (result.ok) {
      navigate('/messages');
      return;
    }
    setError(result.error);
    setFieldErrors(result.fieldErrors ?? {});
  };

  const BCrumb = [
    { to: '/', title: t('nav.home') },
    { to: '/messages', title: t('nav.messages') },
    { title: t('messages.post.title') },
  ];

  const noBuildings = buildings !== null && buildings.data.length === 0;

  return (
    <>
      <BreadcrumbComp title={t('messages.post.title')} items={BCrumb} />
      <ComponentCard className="max-w-3xl" title={t('messages.post.title')} desc={t('messages.post.subtitle')}>
        {noBuildings ? (
          <p className="text-sm light-muted">{t('messages.post.noBuildings')}</p>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {error && (
              <Alert variant="lighterror">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Label>{t('messages.post.category')}</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('messages.post.categoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.data.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError('message_category_id')}
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('messages.post.targets')}</Label>
              {targets.map((draft) => (
                <TargetRow
                  key={draft.key}
                  draft={draft}
                  buildings={buildings?.data ?? []}
                  onChange={(updated) =>
                    setTargets((rows) => rows.map((row) => (row.key === draft.key ? updated : row)))
                  }
                  onRemove={
                    targets.length > 1
                      ? () => setTargets((rows) => rows.filter((row) => row.key !== draft.key))
                      : undefined
                  }
                />
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-fit"
                onClick={() => setTargets((rows) => [...rows, newTarget()])}
              >
                {t('messages.post.addTarget')}
              </Button>
              {fieldError('targets')}
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('messages.post.body')}</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} required />
              {fieldError('body')}
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('messages.post.attachment')}</Label>
              <Input
                type="file"
                disabled={submitting}
                onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
              />
              {fieldError('attachment')}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={submitting || !categoryId || !body.trim() || targets.some((row) => !row.buildingId)}
              >
                {submitting ? t('messages.post.submitting') : t('messages.post.submit')}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/messages">{t('common.cancel')}</Link>
              </Button>
            </div>
          </form>
        )}
      </ComponentCard>
    </>
  );
};

export default PostMessage;

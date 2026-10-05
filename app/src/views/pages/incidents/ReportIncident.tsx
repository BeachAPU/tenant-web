import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import PhotoInput from 'src/components/shared/PhotoInput';
import { Button } from 'src/components/ui/button';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import IncidentPickList from 'src/components/incidents/IncidentPickList';
import MeTooButton from 'src/components/incidents/MeTooButton';
import { useTickets } from 'src/context/tickets-context';
import { useApiGet } from 'src/hooks/useApiGet';
import { apiGet, apiSend } from 'src/lib/api';
import { incidentArea, incidentKind } from 'src/lib/incidents';
import type { PublicIncident } from 'src/types/incident';
import type { ResidentBuilding } from 'src/types/resident';
import type { PaginatedResult, Ticket } from 'src/types/ticket';

// Radix Select can't hold an empty value, so "no area" / "no sub-type" get
// sentinels that are never sent.
const WHOLE_BUILDING = 'whole';
const NO_SUBTYPE = 'none';
// The API's incident photo limit.
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

// Building -> area (or the whole building) -> kind -> optional sub-type ->
// description -> optional photo. The building's open incidents are listed
// as soon as it's picked, with "me too", since only one open incident per
// building + area + kind can exist: a matching one blocks the form up
// front, and a 409 incident_duplicate from a race points at the existing
// incident the same way.
const ReportIncident = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { options } = useTickets();

  const { data: buildings } = useApiGet<{ data: ResidentBuilding[] }>(
    '/api/tenant/resident/buildings',
  );
  const [buildingId, setBuildingId] = useState<number | null>(
    Number(searchParams.get('building_id')) || null,
  );
  const [areaValue, setAreaValue] = useState(WHOLE_BUILDING);
  const [typeId, setTypeId] = useState<number | null>(null);
  const [subtypeValue, setSubtypeValue] = useState(NO_SUBTYPE);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [duplicate, setDuplicate] = useState<PublicIncident | null>(null);

  // A resident with a single building doesn't have to pick it.
  useEffect(() => {
    if (buildingId === null && buildings?.data.length === 1) setBuildingId(buildings.data[0].id);
  }, [buildings, buildingId]);

  const { data: building } = useApiGet<{ data: ResidentBuilding }>(
    buildingId ? `/api/tenant/resident/buildings/${buildingId}` : null,
  );
  const { data: openResult, loading: openLoading } = useApiGet<PaginatedResult<PublicIncident>>(
    buildingId ? '/api/tenant/resident/incidents' : null,
    { building_id: buildingId ?? undefined, state: 'open' },
  );
  const [openIncidents, setOpenIncidents] = useState<PublicIncident[]>([]);
  // useApiGet keeps the previous building's page while the next one loads.
  useEffect(
    () =>
      setOpenIncidents((openResult?.data ?? []).filter((i) => i.building.id === buildingId)),
    [openResult, buildingId],
  );

  const areas = building?.data.id === buildingId ? (building.data.areas ?? []) : [];
  const types = options?.incident_types ?? [];
  const subtypes = types.find((type) => type.id === typeId)?.subtypes ?? [];
  const areaId = areaValue === WHOLE_BUILDING ? null : Number(areaValue);

  // The open incident this report would duplicate, if any (same area - or
  // both whole-building - and same main kind; the sub-type doesn't count).
  const match = useMemo(
    () =>
      typeId === null
        ? undefined
        : openIncidents.find(
            (incident) =>
              incident.incident_type.id === typeId && (incident.area?.id ?? null) === areaId,
          ),
    [openIncidents, typeId, areaId],
  );
  const blocking = duplicate ?? match ?? null;

  const replaceOpen = (updated: PublicIncident) => {
    setOpenIncidents((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    if (duplicate?.id === updated.id) setDuplicate(updated);
  };

  const selectBuilding = (value: string) => {
    setBuildingId(Number(value));
    setAreaValue(WHOLE_BUILDING);
    setDuplicate(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!buildingId || typeId === null || blocking) return;

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const form = new FormData();
    form.set('building_id', String(buildingId));
    if (areaId !== null) form.set('building_area_type_id', String(areaId));
    form.set('incident_type_id', String(typeId));
    if (subtypeValue !== NO_SUBTYPE) form.set('incident_subtype_id', subtypeValue);
    if (description.trim()) form.set('description', description.trim());
    if (photo) form.set('photo', photo);

    const result = await apiSend<Ticket>('/api/tenant/resident/incidents', { body: form });

    if (result.ok) {
      navigate(`/incidents/${result.data.id}`);
      return;
    }

    const existingId = Number(result.details?.existing_incident_id);
    if (result.errorCode === 'incident_duplicate' && existingId) {
      const existing = await apiGet<{ data: PublicIncident }>(
        `/api/tenant/resident/incidents/${existingId}`,
      );
      if (existing.ok) {
        setDuplicate(existing.data.data);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    setError(result.error);
    setFieldErrors(result.fieldErrors ?? {});
  };

  const fieldError = (key: string) =>
    fieldErrors[key] && <p className="text-xs text-error">{fieldErrors[key][0]}</p>;

  const BCrumb = [
    { to: '/', title: t('nav.home') },
    { to: '/incidents', title: t('nav.incidents') },
    { title: t('incidents.report.title') },
  ];

  return (
    <>
      <BreadcrumbComp title={t('incidents.report.title')} items={BCrumb} />
      <ComponentCard
        className="max-w-3xl"
        title={t('incidents.report.cardTitle')}
        desc={t('incidents.report.subtitle')}
      >
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {error && (
            <Alert variant="lighterror">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Label>{t('incidents.fields.building')}</Label>
            <Select value={buildingId ? String(buildingId) : undefined} onValueChange={selectBuilding}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('incidents.report.buildingPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {buildings?.data.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name} — {b.street} {b.housenumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError('building_id')}
          </div>

          {buildingId && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold light-text-navy">
                {t('incidents.report.openAtBuilding')}
              </p>
              {openLoading ? (
                <p className="text-sm light-muted">{t('common.loading')}</p>
              ) : openIncidents.length === 0 ? (
                <p className="text-sm light-muted">{t('incidents.report.noneOpen')}</p>
              ) : (
                <>
                  <p className="text-sm light-muted">{t('incidents.report.openHint')}</p>
                  <IncidentPickList incidents={openIncidents} onChange={replaceOpen} />
                </>
              )}
            </div>
          )}

          {buildingId && (
            <>
              <div className="flex flex-col gap-2">
                <Label>{t('incidents.fields.location')}</Label>
                <Select
                  value={areaValue}
                  onValueChange={(value) => {
                    setAreaValue(value);
                    setDuplicate(null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WHOLE_BUILDING}>{t('incidents.wholeBuilding')}</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={String(area.id)}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError('building_area_type_id')}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>{t('incidents.fields.kind')}</Label>
                  <Select
                    value={typeId !== null ? String(typeId) : undefined}
                    onValueChange={(value) => {
                      setTypeId(Number(value));
                      setSubtypeValue(NO_SUBTYPE);
                      setDuplicate(null);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('incidents.report.kindPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldError('incident_type_id')}
                </div>

                {subtypes.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <Label>{t('incidents.fields.subtype')}</Label>
                    <Select value={subtypeValue} onValueChange={setSubtypeValue}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_SUBTYPE}>{t('incidents.report.noSubtype')}</SelectItem>
                        {subtypes.map((subtype) => (
                          <SelectItem key={subtype.id} value={String(subtype.id)}>
                            {subtype.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldError('incident_subtype_id')}
                  </div>
                )}
              </div>

              {blocking && (
                <Alert variant="lightwarning">
                  <AlertDescription>
                    <div className="flex flex-col gap-3">
                      <span>
                        {t('incidents.report.duplicate', {
                          kind: incidentKind(blocking),
                          area: incidentArea(blocking, t),
                        })}
                      </span>
                      <span className="flex flex-wrap items-center gap-3">
                        <MeTooButton incident={blocking} onChange={replaceOpen} />
                        <Link to={`/incidents/${blocking.id}`} className="light-link-action">
                          {t('incidents.report.openExisting')}
                        </Link>
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Label>{t('incidents.fields.description')}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('incidents.report.descriptionPlaceholder')}
                  maxLength={5000}
                  rows={4}
                />
                <p className="text-xs light-muted">{t('incidents.report.privateHint')}</p>
                {fieldError('description')}
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t('incidents.fields.photo')}</Label>
                <PhotoInput
                  value={photo}
                  onChange={setPhoto}
                  maxBytes={MAX_PHOTO_BYTES}
                  disabled={submitting}
                />
                {fieldError('photo')}
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting || !buildingId || typeId === null || !!blocking}>
              {submitting ? t('incidents.report.submitting') : t('incidents.report.submit')}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/incidents">{t('common.cancel')}</Link>
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
};

export default ReportIncident;

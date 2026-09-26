import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import { useTickets } from 'src/context/tickets-context';
import BuildingApartmentPicker from 'src/components/issues/BuildingApartmentPicker';
import type { ApartmentSummary, BuildingSummary } from 'src/types/ticket';

const CreateIssue = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { options, createTicket } = useTickets();

  const [building, setBuilding] = useState<BuildingSummary | null>(null);
  const [apartment, setApartment] = useState<ApartmentSummary | null>(null);
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!priority && options) {
      const defaultPriority = options.priorities.find((p) => p.is_default);
      if (defaultPriority) setPriority(defaultPriority.key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const BCrumb = [
    { to: '/', title: t('issues.breadcrumbHome') },
    { to: '/issues', title: t('nav.myIssues') },
    { title: t('issues.create.title') },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!building || !category || !title.trim()) return;

    setSubmitting(true);
    const result = await createTicket({
      building_id: building.id,
      apartment_id: apartment?.id ?? null,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority: priority || undefined,
    });
    setSubmitting(false);

    if (result.ok) {
      navigate(`/issues/${result.data.id}`);
    } else {
      setError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
    }
  };

  return (
    <>
      <BreadcrumbComp title={t('issues.create.title')} items={BCrumb} />
      <ComponentCard
        className="max-w-2xl"
        title={t('issues.detail.tabDetails')}
        desc={t('issues.create.subtitle')}
      >
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {error && (
            <Alert variant="lighterror">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <BuildingApartmentPicker
            building={building}
            apartment={apartment}
            onBuildingChange={setBuilding}
            onApartmentChange={setApartment}
          />
          {fieldErrors.building_id && (
            <p className="text-xs text-error -mt-4">{fieldErrors.building_id[0]}</p>
          )}
          {fieldErrors.apartment_id && (
            <p className="text-xs text-error -mt-4">{fieldErrors.apartment_id[0]}</p>
          )}

          <div className="flex flex-col gap-2">
            <Label>{t('issues.create.categoryLabel')}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('issues.create.categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {options?.categories.map((c) => (
                  <SelectItem key={c.key} value={c.key}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t('issues.create.priorityLabel')}</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('issues.create.priorityPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {options?.priorities.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">{t('issues.create.titleLabel')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('issues.create.titlePlaceholder')}
              required
            />
            {fieldErrors.title && <p className="text-xs text-error">{fieldErrors.title[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">{t('issues.create.descriptionLabel')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('issues.create.descriptionPlaceholder')}
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? t('issues.create.submitting') : t('issues.create.submit')}
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
};

export default CreateIssue;

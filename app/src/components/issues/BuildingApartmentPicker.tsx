import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from 'src/icons';
import { Button } from 'src/components/ui/button';
import { Label } from 'src/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from 'src/components/ui/command';
import { useDebouncedValue } from 'src/hooks/useDebouncedValue';
import type { ApartmentSummary, BuildingSummary } from 'src/types/ticket';

async function fetchBuildings(query: string): Promise<BuildingSummary[]> {
  const res = await fetch(`/api/tenant/buildings?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const body = await res.json();
  return (body.data ?? []) as BuildingSummary[];
}

async function fetchApartments(buildingId: number, query: string): Promise<ApartmentSummary[]> {
  const res = await fetch(
    `/api/tenant/buildings/${buildingId}/apartments?q=${encodeURIComponent(query)}`,
  );
  if (!res.ok) return [];
  const body = await res.json();
  return (body.data ?? []) as ApartmentSummary[];
}

const BuildingApartmentPicker = ({
  building,
  apartment,
  onBuildingChange,
  onApartmentChange,
}: {
  building: BuildingSummary | null;
  apartment: ApartmentSummary | null;
  onBuildingChange: (building: BuildingSummary | null) => void;
  onApartmentChange: (apartment: ApartmentSummary | null) => void;
}) => {
  const { t } = useTranslation();

  const [buildingOpen, setBuildingOpen] = useState(false);
  const [buildingSearch, setBuildingSearch] = useState('');
  const debouncedBuildingSearch = useDebouncedValue(buildingSearch, 300);
  const [buildingResults, setBuildingResults] = useState<BuildingSummary[]>([]);
  const [buildingLoading, setBuildingLoading] = useState(false);

  const [apartmentOpen, setApartmentOpen] = useState(false);
  const [apartmentSearch, setApartmentSearch] = useState('');
  const debouncedApartmentSearch = useDebouncedValue(apartmentSearch, 300);
  const [apartmentResults, setApartmentResults] = useState<ApartmentSummary[]>([]);
  const [apartmentLoading, setApartmentLoading] = useState(false);

  useEffect(() => {
    if (!buildingOpen) return;
    let cancelled = false;
    setBuildingLoading(true);
    fetchBuildings(debouncedBuildingSearch).then((results) => {
      if (!cancelled) {
        setBuildingResults(results);
        setBuildingLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedBuildingSearch, buildingOpen]);

  useEffect(() => {
    if (!apartmentOpen || !building) return;
    let cancelled = false;
    setApartmentLoading(true);
    fetchApartments(building.id, debouncedApartmentSearch).then((results) => {
      if (!cancelled) {
        setApartmentResults(results);
        setApartmentLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedApartmentSearch, apartmentOpen, building]);

  const handleSelectBuilding = (selected: BuildingSummary) => {
    onBuildingChange(selected);
    onApartmentChange(null);
    setApartmentSearch('');
    setBuildingOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>{t('issues.create.buildingLabel')}</Label>
        <Popover open={buildingOpen} onOpenChange={setBuildingOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className={`light-input h-10 w-full justify-between border px-3 font-normal light-text-navy ${building ? '' : 'light-input-empty'}`}
            >
              {building
                ? `${building.name} — ${building.street} ${building.housenumber}`
                : t('issues.create.buildingPlaceholder')}
              <ChevronDownIcon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command shouldFilter={false}>
              <CommandInput
                value={buildingSearch}
                onValueChange={setBuildingSearch}
                placeholder={t('issues.create.buildingPlaceholder')}
              />
              <CommandList>
                {!buildingLoading && buildingResults.length === 0 && (
                  <CommandEmpty>{t('issues.create.buildingSearchEmpty')}</CommandEmpty>
                )}
                {buildingResults.map((result) => (
                  <CommandItem key={result.id} onSelect={() => handleSelectBuilding(result)}>
                    {result.name} — {result.street} {result.housenumber}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>{t('issues.create.apartmentLabel')}</Label>
          {building && apartment && (
            <button
              type="button"
              className="text-sm light-link-action"
              onClick={() => onApartmentChange(null)}
            >
              {t('issues.create.skipApartment')}
            </button>
          )}
        </div>
        <Popover open={apartmentOpen} onOpenChange={setApartmentOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              disabled={!building}
              className={`light-input h-10 w-full justify-between border px-3 font-normal light-text-navy ${apartment ? '' : 'light-input-empty'}`}
            >
              {apartment
                ? t('issues.create.apartmentSelected', { doorNumber: apartment.door_number })
                : t('issues.create.apartmentPlaceholder')}
              <ChevronDownIcon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command shouldFilter={false}>
              <CommandInput
                value={apartmentSearch}
                onValueChange={setApartmentSearch}
                placeholder={t('issues.create.apartmentPlaceholder')}
              />
              <CommandList>
                {!apartmentLoading && apartmentResults.length === 0 && (
                  <CommandEmpty>{t('issues.create.apartmentSearchEmpty')}</CommandEmpty>
                )}
                {apartmentResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => {
                      onApartmentChange(result);
                      setApartmentOpen(false);
                    }}
                  >
                    {result.door_number}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <p className="text-xs light-muted">{t('issues.create.apartmentHelp')}</p>
      </div>
    </div>
  );
};

export default BuildingApartmentPicker;

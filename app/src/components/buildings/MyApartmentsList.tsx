import { useTranslation } from 'react-i18next';
import { Badge } from 'src/components/ui/badge';
import type { MyApartment } from 'src/types/resident';

const MyApartmentsList = ({ apartments }: { apartments: MyApartment[] }) => {
  const { t } = useTranslation();

  return (
    <ul className="flex flex-col gap-2">
      {apartments.map((apartment) => (
        <li
          key={apartment.id}
          className="flex flex-wrap items-center gap-2 text-sm light-text-navy"
        >
          <span className="font-semibold">
            {t('bills.doorNumber', { door: apartment.door_number })}
          </span>
          {apartment.floor !== null && (
            <span className="light-muted">{t('buildings.floor', { floor: apartment.floor })}</span>
          )}
          {apartment.useful_area_m2 !== null && (
            <span className="light-muted">{apartment.useful_area_m2} m²</span>
          )}
          <Badge variant={apartment.relation === 'resident' ? 'lightInfo' : 'lightSuccess'}>
            {t(`buildings.relation.${apartment.relation}`)}
          </Badge>
        </li>
      ))}
    </ul>
  );
};

export default MyApartmentsList;

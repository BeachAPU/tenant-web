import { AngleLeftIcon, AngleRightIcon } from 'src/icons';
import { useTranslation } from 'react-i18next';

// DESIGN.md §4: bottom-right `← 1 / 3 →`, muted text, arrows turn navy on
// hover and drop to 40% opacity when disabled.
const Pagination = ({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) => {
  const { t } = useTranslation();
  const arrow =
    'flex h-8 w-8 items-center justify-center rounded-full cursor-pointer hover:text-foreground disabled:cursor-default disabled:opacity-40';

  return (
    <div className="flex items-center justify-end gap-2 text-sm light-muted">
      <button
        type="button"
        className={arrow}
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
        aria-label={t('issues.pagination.previous')}
      >
        <AngleLeftIcon className="size-5 [&_path]:stroke-current" />
      </button>
      <span>
        {current} / {total}
      </span>
      <button
        type="button"
        className={arrow}
        disabled={current >= total}
        onClick={() => onChange(current + 1)}
        aria-label={t('issues.pagination.next')}
      >
        <AngleRightIcon className="size-5 [&_path]:stroke-current" />
      </button>
    </div>
  );
};

export default Pagination;

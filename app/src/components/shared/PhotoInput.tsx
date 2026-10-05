import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon, FileIcon } from 'src/icons';
import { Button } from 'src/components/ui/button';
import { formatSize } from 'src/lib/resident';

// The image types the API accepts for both incident photos and note
// attachments (notes also take documents, but residents only attach photos).
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,image/bmp,image/heic,.heic';

// One optional photo: a button that opens the file picker, then the chosen
// file's name with a remove button. Checks the size up front (the API has
// the final say) so a too-large photo fails before a long upload.
const PhotoInput = ({
  value,
  onChange,
  maxBytes,
  disabled,
}: {
  value: File | null;
  onChange: (file: File | null) => void;
  maxBytes: number;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (file: File | undefined) => {
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    if (file.size > maxBytes) {
      setError(t('photo.tooLarge', { max: formatSize(maxBytes) }));
      return;
    }
    setError(null);
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handleChange(e.target.files?.[0])}
      />
      {value ? (
        <div className="flex items-center gap-2 min-w-0 text-sm light-text-navy">
          <FileIcon className="size-4 shrink-0 fill-current" />
          <span className="truncate">{value.name}</span>
          <span className="light-muted shrink-0">({formatSize(value.size)})</span>
          <button
            type="button"
            className="light-link-action shrink-0"
            aria-label={t('photo.remove')}
            disabled={disabled}
            onClick={() => onChange(null)}
          >
            <CloseIcon className="size-4 fill-current" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {t('photo.add')}
        </Button>
      )}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};

export default PhotoInput;

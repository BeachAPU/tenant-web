import { useTranslation } from 'react-i18next';
import { useAuth } from 'src/context/auth-context';
import { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, type SupportedLanguage } from 'src/i18n';

const LABELS: Record<SupportedLanguage, string> = {
  en: 'EN',
  hu: 'HU',
};

// DESIGN.md §9.2: EN / HU segmented pill in the user menu (a copy of
// admin-ui's common/LanguageSwitcher).
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { status, savePreferences } = useAuth();
  const current = (i18n.language in LABELS ? i18n.language : 'en') as SupportedLanguage;

  const select = (lang: SupportedLanguage) => {
    if (lang === current) return;
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // best-effort only
    }
    // Best-effort account sync; the local switch already applied.
    if (status === 'authenticated') void savePreferences({ locale: lang });
  };

  return (
    <div className="light-icon-btn flex items-center rounded-full p-0.5">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          aria-pressed={current === lang}
          onClick={() => select(lang)}
          className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            current === lang ? 'light-lang-active' : 'light-lang-inactive'
          }`}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;

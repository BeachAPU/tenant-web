import { useTranslation } from 'react-i18next';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import ComponentCard from 'src/components/shared/ComponentCard';
import { Label } from 'src/components/ui/label';
import { RadioGroup, RadioGroupItem } from 'src/components/ui/radio-group';
import { useTheme } from 'src/components/provider/theme-provider';
import { useAuth } from 'src/context/auth-context';
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY, type SupportedLanguage } from 'src/i18n';
import type { ThemePreference } from 'src/types/auth';

const THEME_OPTIONS: { value: ThemePreference; labelKey: string }[] = [
  { value: 'light', labelKey: 'settings.themeLight' },
  { value: 'dark', labelKey: 'settings.themeDark' },
  { value: 'system', labelKey: 'settings.themeSystem' },
];

const LANGUAGE_LABEL_KEYS: Record<SupportedLanguage, string> = {
  en: 'settings.languageEnglish',
  hu: 'settings.languageHungarian',
};

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, environment, savePreferences } = useAuth();

  const BCrumb = [{ to: '/', title: t('settings.breadcrumbHome') }, { title: t('nav.settings') }];

  const handleThemeChange = (value: string) => {
    const nextTheme = value as ThemePreference;
    setTheme(nextTheme);
    void savePreferences({ theme: nextTheme });
  };

  const handleLanguageChange = (value: string) => {
    const nextLanguage = value as SupportedLanguage;
    i18n.changeLanguage(nextLanguage);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // best-effort only
    }
    void savePreferences({ locale: nextLanguage });
  };

  return (
    <>
      <BreadcrumbComp title={t('nav.settings')} items={BCrumb} />
      <div className="flex flex-col gap-6">
        <ComponentCard
          title={t('settings.appearanceTitle')}
          desc={t('settings.appearanceSubtitle')}
        >
          <RadioGroup
            value={theme}
            onValueChange={handleThemeChange}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {THEME_OPTIONS.map((option) => (
              <Label
                key={option.value}
                htmlFor={`theme-${option.value}`}
                className="light-input flex items-center gap-3 border p-4 cursor-pointer"
              >
                <RadioGroupItem value={option.value} id={`theme-${option.value}`} />
                {t(option.labelKey)}
              </Label>
            ))}
          </RadioGroup>
        </ComponentCard>

        <ComponentCard title={t('settings.languageTitle')} desc={t('settings.languageSubtitle')}>
          <RadioGroup
            value={i18n.language}
            onValueChange={handleLanguageChange}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <Label
                key={language}
                htmlFor={`language-${language}`}
                className="light-input flex items-center gap-3 border p-4 cursor-pointer"
              >
                <RadioGroupItem value={language} id={`language-${language}`} />
                {t(LANGUAGE_LABEL_KEYS[language])}
              </Label>
            ))}
          </RadioGroup>
        </ComponentCard>

        <ComponentCard title={t('settings.accountTitle')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="text-xs light-muted mb-1">{t('settings.email')}</p>
              <p className="text-sm light-text-navy">{user?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs light-muted mb-1">{t('settings.role')}</p>
              <p className="text-sm light-text-navy capitalize">{user?.role ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs light-muted mb-1">{t('settings.locale')}</p>
              <p className="text-sm light-text-navy">{user?.locale ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs light-muted mb-1">{t('settings.environment')}</p>
              <p className="text-sm light-text-navy capitalize">{environment ?? '—'}</p>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default Settings;

import { useTranslation } from 'react-i18next';
import { useTheme } from 'src/components/provider/theme-provider';
import { useAuth } from 'src/context/auth-context';
import { MoonIcon, SunIcon } from 'src/icons';

// DESIGN.md §9.2: light/dark segmented pill in the user menu, the same shape
// as LanguageSwitcher (a copy of admin-ui's common/ThemeSwitcher).
const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const { status, savePreferences } = useAuth();
  const { t } = useTranslation();

  // 'system' (the pre-login default) shows whichever mode is actually applied.
  const current =
    theme === 'system'
      ? document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light'
      : theme;

  const options = [
    { mode: 'light' as const, label: t('header.lightMode'), Icon: SunIcon },
    { mode: 'dark' as const, label: t('header.darkMode'), Icon: MoonIcon },
  ];

  const select = (mode: 'light' | 'dark') => {
    if (mode === theme) return;
    setTheme(mode);
    // Best-effort account sync; the local switch already applied.
    if (status === 'authenticated') void savePreferences({ theme: mode });
  };

  return (
    <div className="light-icon-btn flex items-center rounded-full p-0.5">
      {options.map(({ mode, label, Icon }) => (
        <button
          key={mode}
          type="button"
          aria-label={label}
          aria-pressed={current === mode}
          title={label}
          onClick={() => select(mode)}
          className={`flex cursor-pointer items-center justify-center rounded-full px-2.5 py-1 transition-colors ${
            current === mode ? 'light-lang-active' : 'light-lang-inactive'
          }`}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;

import { MoonIcon, SunIcon } from 'src/components/shared/AdminInlineIcons';
import { useTheme } from 'src/components/provider/theme-provider';
import { useAuth } from 'src/context/auth-context';

// DESIGN.md §5: round `.light-icon-btn` theme switch, shared by the header
// and the auth pages.
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { status, savePreferences } = useAuth();

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    // Best-effort account sync, same as Settings - the toggle already
    // applied locally via setTheme regardless.
    if (status === 'authenticated') void savePreferences({ theme: next });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="light-icon-btn flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full cursor-pointer"
    >
      {theme === 'light' ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
    </button>
  );
};

export default ThemeToggle;

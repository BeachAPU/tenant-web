import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import CardBox from 'src/components/shared/CardBox';
import { Label } from 'src/components/ui/label';
import { RadioGroup, RadioGroupItem } from 'src/components/ui/radio-group';
import { useTheme } from 'src/components/provider/theme-provider';
import { useAuth } from 'src/context/auth-context';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, environment } = useAuth();

  const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Settings' },
  ];

  return (
    <>
      <BreadcrumbComp title="Settings" items={BCrumb} />
      <div className="flex flex-col gap-6">
        <CardBox className="p-6">
          <h5 className="card-title mb-1">Appearance</h5>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Choose how the admin dashboard looks on this device.
          </p>
          <RadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as (typeof THEME_OPTIONS)[number]['value'])}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {THEME_OPTIONS.map((option) => (
              <Label
                key={option.value}
                htmlFor={`theme-${option.value}`}
                className="flex items-center gap-3 rounded-lg border border-ld p-4 cursor-pointer"
              >
                <RadioGroupItem value={option.value} id={`theme-${option.value}`} />
                {option.label}
              </Label>
            ))}
          </RadioGroup>
        </CardBox>

        <CardBox className="p-6">
          <h5 className="card-title mb-6">Account</h5>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p>{user?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="capitalize">{user?.role ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Locale</p>
              <p>{user?.locale ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Environment</p>
              <p className="capitalize">{environment ?? '—'}</p>
            </div>
          </div>
        </CardBox>
      </div>
    </>
  );
};

export default Settings;

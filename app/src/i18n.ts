import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import hu from './locales/hu/translation.json';

export const SUPPORTED_LANGUAGES = ['en', 'hu'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = 'tenant-web-language';

const storedLanguage: SupportedLanguage | undefined = (() => {
  try {
    const value = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return value && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)
      ? (value as SupportedLanguage)
      : undefined;
  } catch {
    return undefined;
  }
})();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hu: { translation: hu },
  },
  lng: storedLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;

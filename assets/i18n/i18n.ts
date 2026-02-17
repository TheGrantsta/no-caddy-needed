import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import en from './en';

const i18n = new I18n({ en });

const locales = getLocales();
i18n.locale = locales[0]?.languageCode ?? 'en';

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const t = (key: string, options?: Record<string, string | number>): string => {
    return i18n.t(key, options);
};

export default i18n;

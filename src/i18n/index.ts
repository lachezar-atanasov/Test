import { bg, TranslationKeys } from './translations/bg';

export type Language = 'bg' | 'en';

const translations: Record<Language, TranslationKeys> = {
  bg,
  // English translations can be added later
  en: bg, // Fallback to Bulgarian for now
};

let currentLanguage: Language = 'bg';

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, unknown>
    ? `${Key}.${PathImpl<T[Key], keyof T[Key]> & string}` | Key
    : Key
  : never;

type Path<T> = PathImpl<T, keyof T>;

type PathValue<T, P extends Path<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Path<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

/**
 * Get a translation by key path
 * @example t('auth.login') // Returns 'Вход'
 * @example t('dashboard.dueIn', { days: 3 }) // Returns 'След 3 дни'
 */
export function t<P extends Path<TranslationKeys>>(
  path: P,
  params?: Record<string, string | number>
): string {
  const keys = path.split('.');
  let result: unknown = translations[currentLanguage];

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      // Fallback to key if translation not found
      return path;
    }
  }

  if (typeof result !== 'string') {
    return path;
  }

  // Replace placeholders with params
  if (params) {
    return result.replace(/\{(\w+)\}/g, (_, key) => {
      return params[key]?.toString() ?? `{${key}}`;
    });
  }

  return result;
}

export { bg };
export type { TranslationKeys };

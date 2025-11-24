// AI Localization Types
export type SupportedLanguage = "en" | "ta" | "hi" | "te" | "kn";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  direction: "ltr" | "rtl";
}

export interface TranslationCache {
  [language: string]: {
    [key: string]: string;
  };
}

export interface TranslationParams {
  [key: string]: string | number;
}

export interface I18nContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, params?: TranslationParams) => string;
  isLoading: boolean;
  _forceUpdate?: number;
}


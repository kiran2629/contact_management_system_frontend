import { useState, useEffect, ReactNode } from "react";
import { I18nContext } from "./i18nContext";
import { SupportedLanguage, TranslationParams } from "./types";
import { translationService } from "./translationService";
import englishTranslations from "./locales/en.json";

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem("crm_language");
    return (saved as SupportedLanguage) || "en";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [translations, setTranslations] = useState<Record<string, string>>(() => {
    // Load all translations for the current language immediately
    const saved = localStorage.getItem("crm_language");
    const lang = (saved as SupportedLanguage) || "en";
    return translationService.getAllTranslations(lang);
  });

  useEffect(() => {
    localStorage.setItem("crm_language", currentLanguage);
  }, [currentLanguage]);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const allTranslations = translationService.getAllTranslations(currentLanguage);
        console.log(`🌐 Language changed to: ${currentLanguage}`);
        console.log(`📚 Loaded ${Object.keys(allTranslations).length} translations`);
        console.log(`✅ Sample: dashboard = "${allTranslations.dashboard}"`);
        console.log(`✅ Sample: contacts = "${allTranslations.contacts}"`);
        console.log(`✅ Sample: settings = "${allTranslations.settings}"`);
        setTranslations(allTranslations);
        setForceUpdate(prev => prev + 1); // Force context consumers to re-render
      } catch (error) {
        console.error("❌ Error loading translations:", error);
        // Fallback to English
        setTranslations(translationService.getAllTranslations("en"));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTranslations();
  }, [currentLanguage]);

  const t = (key: string, params?: TranslationParams): string => {
    let text = translations[key] || englishTranslations[key as keyof typeof englishTranslations] || key;

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`{{${paramKey}}}`, "g"), String(paramValue));
      });
    }

    return text;
  };

  const setLanguage = async (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
  };

  // Create a stable context value that changes when language changes
  const contextValue = {
    currentLanguage,
    setLanguage,
    t,
    isLoading,
    _forceUpdate: forceUpdate, // Include this to force re-renders
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};


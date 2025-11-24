import { createContext } from "react";
import { I18nContextType, SupportedLanguage } from "./types";

export const I18nContext = createContext<I18nContextType>({
  currentLanguage: "en",
  setLanguage: async () => {},
  t: (key: string) => key,
  isLoading: false,
});


import { SupportedLanguage, TranslationCache } from "./types";
import englishTranslations from "./locales/en.json";
import tamilTranslations from "./locales/ta.json";
import hindiTranslations from "./locales/hi.json";
import teluguTranslations from "./locales/te.json";
import kannadaTranslations from "./locales/kn.json";

class TranslationService {
  private cache: TranslationCache = {
    en: englishTranslations,
    ta: tamilTranslations,
    hi: hindiTranslations,
    te: teluguTranslations,
    kn: kannadaTranslations,
  };
  private cacheKey = "crm_translation_cache";
  private aiConfig = {
    provider: (import.meta.env.VITE_AI_PROVIDER as string) || "openai",
    apiKey: import.meta.env.VITE_AI_API_KEY || "",
    model: import.meta.env.VITE_AI_MODEL || "gpt-4o-mini",
  };

  constructor() {
    this.loadCache();
  }

  private loadCache() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        this.cache = { ...this.cache, ...parsedCache };
      }
    } catch (error) {
      console.error("Error loading translation cache:", error);
    }
  }

  private saveCache() {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(this.cache));
    } catch (error) {
      console.error("Error saving translation cache:", error);
    }
  }

  async getTranslation(key: string, targetLanguage: SupportedLanguage): Promise<string> {
    // Return English translation
    if (targetLanguage === "en") {
      return englishTranslations[key as keyof typeof englishTranslations] || key;
    }

    // Check if we have a static translation for this language
    const staticTranslation = this.cache[targetLanguage]?.[key];
    if (staticTranslation) {
      return staticTranslation;
    }

    // If no static translation, try AI (if API key is available)
    if (this.aiConfig.apiKey) {
      const translated = await this.translateWithAI(key, targetLanguage);
      if (!this.cache[targetLanguage]) {
        this.cache[targetLanguage] = {};
      }
      this.cache[targetLanguage][key] = translated;
      this.saveCache();
      return translated;
    }

    // Fallback to English if no translation available
    return englishTranslations[key as keyof typeof englishTranslations] || key;
  }

  private async translateWithAI(key: string, targetLanguage: SupportedLanguage): Promise<string> {
    const sourceText = englishTranslations[key as keyof typeof englishTranslations] || key;
    const languageNames: Record<SupportedLanguage, string> = {
      en: "English", ta: "Tamil", hi: "Hindi", te: "Telugu", kn: "Kannada",
    };

    if (!this.aiConfig.apiKey) {
      return sourceText;
    }

    try {
      if (this.aiConfig.provider === "openai") {
        return await this.translateWithOpenAI(sourceText, languageNames[targetLanguage]);
      }
      return sourceText;
    } catch (error) {
      console.error("AI Translation Error:", error);
      return sourceText;
    }
  }

  private async translateWithOpenAI(text: string, targetLanguage: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.aiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: this.aiConfig.model,
        messages: [
          {
            role: "system",
            content: `Translate UI text from English to ${targetLanguage}. Keep placeholders like {{name}} intact. Return ONLY the translated text.`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || text;
  }

  clearCache() {
    this.cache = {
      en: englishTranslations,
      ta: tamilTranslations,
      hi: hindiTranslations,
      te: teluguTranslations,
      kn: kannadaTranslations,
    };
    localStorage.removeItem(this.cacheKey);
  }
  
  // Get all available translations for a language (for bulk loading)
  getAllTranslations(language: SupportedLanguage): Record<string, string> {
    return this.cache[language] || {};
  }
}

export const translationService = new TranslationService();


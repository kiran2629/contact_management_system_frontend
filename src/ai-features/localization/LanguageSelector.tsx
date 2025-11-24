import { motion } from "framer-motion";
import { Globe, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "./useTranslation";
import { LanguageInfo, SupportedLanguage } from "./types";

const languages: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", direction: "ltr" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", direction: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", direction: "ltr" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", direction: "ltr" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", direction: "ltr" },
];

export const LanguageSelector = () => {
  const { currentLanguage, setLanguage, isLoading } = useTranslation();

  const handleLanguageChange = (value: SupportedLanguage) => {
    setLanguage(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Language</h3>
            <p className="text-sm text-muted-foreground">Choose your preferred language</p>
          </div>
        </div>
        {isLoading && (
          <Badge variant="secondary" className="gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading...
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {languages.map((lang) => {
          const isActive = lang.code === currentLanguage;
          return (
            <motion.div key={lang.code} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant={isActive ? "default" : "outline"}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full justify-start gap-3 h-auto py-4 ${
                  isActive ? "bg-gradient-to-br from-primary to-secondary text-white" : ""
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{lang.name}</div>
                  <div className={`text-sm ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                    {lang.nativeName}
                  </div>
                </div>
                {isActive && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
                    <Check className="w-5 h-5" />
                  </motion.div>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
        <div className="flex gap-3">
          <Globe className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">AI-Powered Translation</p>
            <p className="text-xs text-muted-foreground">
              Translations are generated using AI and cached locally for better performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


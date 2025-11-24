import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2 } from "lucide-react";

interface VoiceIndicatorProps {
  isListening: boolean;
  transcript: string;
}

export const VoiceIndicator = ({ isListening, transcript }: VoiceIndicatorProps) => {
  return (
    <AnimatePresence>
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-6 z-40 max-w-sm"
        >
          <div className="glass-card rounded-2xl border border-border/50 shadow-2xl p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex-shrink-0"
              >
                <div className="p-2 rounded-full bg-gradient-to-br from-red-500 to-pink-500">
                  <Mic className="w-4 h-4 text-white" />
                </div>
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Listening...</p>
                <p className="text-xs text-muted-foreground">Speak now</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 h-12 mb-2">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: ["20%", "100%", "20%"] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                  className="w-1 bg-gradient-to-t from-primary to-secondary rounded-full"
                />
              ))}
            </div>

            {transcript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-3 border-t border-border/50"
              >
                <div className="flex items-start gap-2">
                  <Volume2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground flex-1">{transcript}</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


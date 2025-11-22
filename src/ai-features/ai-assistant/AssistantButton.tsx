import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssistantPanel } from "./AssistantPanel";

export const AssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Ultra Premium Floating Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.5,
        }}
        className="fixed bottom-6 right-6 z-40"
      >
        {/* Multi-layer Glow Effect */}
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 rounded-full blur-2xl"
        />

        {/* Secondary Glow */}
        <motion.div
          animate={{
            rotate: [0, 360],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 bg-gradient-to-r from-secondary/30 to-primary/30 rounded-full blur-xl"
        />

        <motion.div
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.92 }}
          className="relative"
        >
          <Button
            onClick={togglePanel}
            size="lg"
            className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary via-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all relative overflow-hidden group border-2 border-white/20"
          >
            {/* Animated Background Gradient */}
            <motion.div
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              style={{ backgroundSize: "200% 200%" }}
            />

            {/* Rotating Ring */}
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full"
            />

            {/* Icon */}
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  <X className="h-7 w-7 text-white drop-shadow-lg" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <MessageSquare className="h-7 w-7 text-white drop-shadow-lg" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* AI Badge */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute -top-1 -right-1"
              >
                <Badge className="h-7 w-7 rounded-full p-0 flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-background shadow-lg">
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-white drop-shadow" />
                  </motion.div>
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse Indicator */}
          {!isOpen && (
            <>
              <motion.div
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                className="absolute inset-0 rounded-full border-2 border-primary"
              />
              <motion.div
                animate={{
                  scale: [1, 2.2, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.5,
                }}
                className="absolute inset-0 rounded-full border-2 border-secondary"
              />
            </>
          )}
        </motion.div>

        {/* Tooltip */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.8 }}
              transition={{ delay: 2 }}
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-lg rounded-lg" />
                <div className="relative bg-gradient-to-br from-primary to-secondary text-white px-4 py-2 rounded-lg shadow-xl border border-white/20">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">AI Assistant</span>
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">Click to chat</p>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-gradient-to-br from-primary to-secondary border-r border-t border-white/20" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Assistant Panel */}
      <AssistantPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};


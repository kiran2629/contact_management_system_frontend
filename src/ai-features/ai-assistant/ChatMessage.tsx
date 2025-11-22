import { motion } from "framer-motion";
import { 
  Bot, User, ArrowRight, Search, Filter, Plus, Eye, BarChart3, 
  Download, FileText, Sparkles, TrendingUp
} from "lucide-react";
import { ChatMessage as ChatMessageType } from "./types";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: ChatMessageType;
  onActionClick: (action: any) => void;
  isLatest?: boolean;
}

export const ChatMessage = ({ message, onActionClick, isLatest }: ChatMessageProps) => {
  const isUser = message.role === "user";

  const getActionIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      search_contacts: Search,
      filter_category: Filter,
      create_contact: Plus,
      view_contact: Eye,
      navigate: ArrowRight,
      show_stats: BarChart3,
      filter_role: Filter,
      export_data: Download,
      update_contact: FileText,
    };
    return iconMap[type] || ArrowRight;
  };

  const getActionColor = (type: string) => {
    const colorMap: Record<string, string> = {
      search_contacts: "hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400",
      filter_category: "hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-600 dark:hover:text-purple-400",
      create_contact: "hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-600 dark:hover:text-green-400",
      view_contact: "hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-600 dark:hover:text-amber-400",
      show_stats: "hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-600 dark:hover:text-cyan-400",
      navigate: "hover:bg-primary/10 hover:border-primary/30 hover:text-primary",
    };
    return colorMap[type] || "hover:bg-primary/10 hover:border-primary/30";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-5`}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1
          }}
          className="flex-shrink-0"
        >
          <div className="relative">
            {/* Animated glow */}
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/40 rounded-xl blur-md"
            />
            
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center border border-primary/20 shadow-lg">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Bot className="w-5 h-5 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      <div className={`flex flex-col gap-2.5 ${isUser ? "items-end" : "items-start"} max-w-[85%]`}>
        {/* Message Bubble */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.05 }}
          className={`rounded-2xl px-4 py-3 backdrop-blur-sm relative overflow-hidden ${
            isUser
              ? "bg-gradient-to-br from-primary via-primary to-secondary text-white shadow-lg shadow-primary/20"
              : "bg-gradient-to-br from-muted/80 to-muted/60 text-foreground border border-border/50 shadow-md"
          }`}
        >
          {/* Subtle gradient overlay for AI messages */}
          {!isUser && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
          )}

          <p className="text-sm leading-relaxed whitespace-pre-wrap relative z-10">
            {message.content}
          </p>

          {/* Sparkle effect for latest AI message */}
          {!isUser && isLatest && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        {message.actions && message.actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 max-w-full"
          >
            {message.actions.map((action, index) => {
              const Icon = getActionIcon(action.type);
              const colorClass = getActionColor(action.type);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    delay: 0.3 + (index * 0.08),
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onActionClick(action)}
                    className={`gap-2 transition-all duration-300 border-2 ${colorClass} shadow-sm hover:shadow-md font-medium`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Timestamp */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[10px] text-muted-foreground px-1"
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </motion.span>
      </div>

      {isUser && (
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1
          }}
          className="flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center border border-border/50 shadow-sm">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};


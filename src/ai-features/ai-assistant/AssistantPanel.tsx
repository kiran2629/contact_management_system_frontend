import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Sparkles, Trash2, Zap, TrendingUp } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { assistantService } from "./assistantService";
import { ChatMessage } from "./ChatMessage";
import { ChatMessage as ChatMessageType, ActionInstruction } from "./types";
import { toast } from "sonner";
import { RootState } from "@/store/store";
import { useGetContactsQuery } from "@/store/services/contactsApi";
import { useGetDashboardQuery } from "@/store/services/dashboardApi";
import { useGetUsersQuery } from "@/store/services/usersApi";

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssistantPanel = ({ isOpen, onClose }: AssistantPanelProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: contacts = [] } = useGetContactsQuery();
  const { data: dashboardStats } = useGetDashboardQuery();
  const { data: allUsers = [] } = useGetUsersQuery(undefined, {
    skip: user?.role !== "Admin", // Only fetch for admins
  });

  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set user and contacts context when panel opens
  useEffect(() => {
    if (isOpen && user) {
      assistantService.setUserContext({
        id: user.id!,
        username: user.username!,
        email: user.email!,
        role: user.role!,
        allowed_categories: user.allowed_categories || [],
        permissions: user.permissions,
      });

      // Set contacts context for smarter suggestions
      const contactsContext = contacts.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        categories: c.categories,
        tags: c.tags,
        status: c.status,
        leadScore: c.leadScore,
      }));
      assistantService.setContactsContext(contactsContext);

      // Load history or show welcome
      const history = assistantService.getHistory();
      if (history.length === 0) {
        showWelcomeMessage();
      } else {
        setMessages(history);
      }
    }
  }, [isOpen, user, contacts]);

  const showWelcomeMessage = () => {
    const welcomeMessage: ChatMessageType = {
      id: "welcome",
      role: "assistant",
      content: `👋 **Hi ${user?.username || 'there'}!** I'm your AI CRM assistant.\n\nI can help you:\n• 🔍 **Search contacts** - "Find John from Acme Corp"\n• 📊 **Filter by category** - "Show marketing contacts"\n• ➕ **Create contacts** - "Add new client"\n• 📈 **View statistics** - "Show my dashboard"\n• 🧭 **Navigate** - "Open settings"\n\n**Your Current Stats:**\n• ${contacts.length} contacts available\n• Role: ${user?.role}\n• Categories: ${user?.allowed_categories.join(", ")}\n\nWhat would you like to do?`,
      timestamp: new Date(),
      actions: [
        {
          type: "search_contacts",
          label: "Search Contacts",
          params: { query: "" },
        },
        {
          type: "navigate",
          label: "View Dashboard",
          params: { path: "/dashboard" },
        },
        {
          type: "create_contact",
          label: "Create Contact",
          params: {},
        },
      ],
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    try {
      // Build context with REAL API DATA
      const context = {
        currentPage: location.pathname,
        searchQuery: new URLSearchParams(location.search).get("search") || undefined,
        selectedCategory: new URLSearchParams(location.search).get("category") || undefined,
        recentStats: dashboardStats,
        // Pass real data for AI to process
        contacts: contacts || [],
        allUsers: user?.role === "Admin" ? allUsers : [],
        dashboardData: dashboardStats,
      };

      // Send to AI service with real data
      const response = await assistantService.sendMessage(userMessage, context);

      // Update messages with AI response
      const updatedHistory = assistantService.getHistory();
      setMessages(updatedHistory);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: ActionInstruction) => {
    switch (action.type) {
      case "navigate":
        navigate(action.params.path);
        toast.success(`Navigating to ${action.label}`);
        onClose();
        break;

      case "search_contacts":
        const searchQuery = action.params.query || "";
        navigate(`/contacts${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`);
        toast.success(searchQuery ? `Searching for "${searchQuery}"` : "Opening contacts");
        onClose();
        break;

      case "filter_category":
        navigate(`/contacts?category=${encodeURIComponent(action.params.category)}`);
        toast.success(`Filtering by ${action.params.category}`);
        onClose();
        break;

      case "create_contact":
        navigate("/contacts/new");
        toast.success("Opening new contact form");
        onClose();
        break;

      case "view_contact":
        navigate(`/contacts/${action.params.id}`);
        toast.success("Opening contact details");
        onClose();
        break;

      case "show_stats":
        navigate("/dashboard");
        toast.success("Opening dashboard");
        onClose();
        break;

      case "filter_role":
        navigate(`/admin/users?role=${action.params.role}`);
        toast.success(`Filtering users by ${action.params.role}`);
        onClose();
        break;

      case "export_data":
        toast.info("Export feature coming soon!");
        break;

      default:
        toast.info("Action not yet implemented");
    }
  };

  const handleClearHistory = () => {
    assistantService.clearHistory();
    setMessages([]);
    showWelcomeMessage();
    toast.success("Conversation cleared");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[550px] p-0 flex flex-col border-l border-border/50">
        {/* Premium Header */}
        <div className="relative flex items-center justify-between p-5 border-b border-border/50 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5">
          {/* Animated Background */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10"
            style={{ backgroundSize: "200% 200%" }}
          />

          <div className="relative flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-primary/30 rounded-xl blur-md"
              />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI Assistant
              </h2>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
                <p className="text-xs text-muted-foreground">Ready to help</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearHistory}
              className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-5 py-3 border-b border-border/30 bg-muted/30">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">{contacts.length}</span>
              <span className="text-muted-foreground">contacts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-medium">{user?.role}</span>
            </div>
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              {user?.allowed_categories.length} categories
            </Badge>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-5 py-4">
          <div className="space-y-1">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                onActionClick={handleActionClick}
                isLatest={index === messages.length - 1}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                </div>
                <div className="bg-muted/80 rounded-2xl px-4 py-3 border border-border/50">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 bg-primary rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-gradient-to-t from-muted/30 to-transparent">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about your CRM..."
              disabled={isLoading}
              className="flex-1 border-2 focus:border-primary transition-colors"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px]">Enter</kbd> to send • 
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px] ml-1">Shift + Enter</kbd> for new line
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};


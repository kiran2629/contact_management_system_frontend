import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Info, Sparkles, Navigation, Search, Filter, BarChart3, Calendar, Database, Palette, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { voiceService } from "./voiceService";
import { VoiceActionHandler } from "./voiceActions";
import { VoiceIndicator } from "./VoiceIndicator";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/store/store";

export const VoiceButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [showCommands, setShowCommands] = useState(false);
  const [actionHandler] = useState(() => new VoiceActionHandler(navigate, dispatch, user));

  useEffect(() => {
    setIsSupported(voiceService.isSupported());
  }, []);
  
  // Update user context when user changes
  useEffect(() => {
    if (user) {
      actionHandler.setUser(user);
      console.log("Voice Commands - User context updated:", {
        role: user.role,
        allowed_categories: user.allowed_categories,
        permissions: user.permissions,
      });
    }
  }, [user, actionHandler]);

  const handleVoiceToggle = () => {
    if (!isSupported) {
      toast.error("Voice recognition is not supported in this browser");
      return;
    }

    if (isListening) {
      voiceService.stop();
      setIsListening(false);
      setTranscript("");
    } else {
      voiceService.start({
        onResult: (text, isFinal) => {
          setTranscript(text);
          if (isFinal) {
            try {
              const result = actionHandler.processCommand(text);
              if (result.success) {
                toast.success("Voice Command", {
                  description: result.message,
                });
                setTranscript("");
                setIsListening(false);
              } else {
                toast.error("Command Not Recognized", {
                  description: result.message || "Please try again or check your permissions.",
                });
              }
            } catch (error: any) {
              // Handle permission errors
              toast.error("Permission Denied", {
                description: error.message || "You don't have permission to perform this action.",
              });
              setTranscript("");
              setIsListening(false);
            }
          }
        },
        onEnd: () => {
          setIsListening(false);
          setTranscript("");
        },
        onError: (error) => {
          setIsListening(false);
          setTranscript("");
          if (error === "not-allowed") {
            toast.error("Microphone access denied");
          } else if (error === "no-speech") {
            toast.warning("No speech detected");
          } else {
            toast.error("Voice recognition error");
          }
        },
      });
      setIsListening(true);
      toast.info("Listening... Say a command!");
    }
  };

  // Command categories for display
  const commandCategories = [
    {
      icon: Navigation,
      title: "Navigation",
      color: "from-blue-500 to-cyan-500",
      commands: [
        "Open dashboard",
        "Go to contacts",
        "Show settings",
        "View profile",
        "Open activity logs",
        "Go back / Go home",
      ],
    },
    {
      icon: Search,
      title: "Search & Filter",
      color: "from-purple-500 to-pink-500",
      commands: [
        "Search for [name]",
        "Find [company]",
        "Show marketing contacts",
        "Show client contacts",
        "Show all contacts",
      ],
    },
    {
      icon: BarChart3,
      title: "Analytics",
      color: "from-green-500 to-emerald-500",
      commands: [
        "Show statistics",
        "How many contacts?",
        "Show distribution",
        "Show top contacts",
        "Show data quality",
      ],
    },
    {
      icon: Calendar,
      title: "Reminders",
      color: "from-orange-500 to-red-500",
      commands: [
        "Show upcoming birthdays",
        "Who needs follow-up?",
        "Show inactive contacts",
      ],
    },
    {
      icon: Database,
      title: "Data Management",
      color: "from-teal-500 to-blue-500",
      commands: [
        "Find duplicates",
        "Export contacts",
        "Add new contact",
        "Show recent contacts",
        "Sort by name/company/date/score",
      ],
    },
    {
      icon: Palette,
      title: "UI Controls",
      color: "from-pink-500 to-rose-500",
      commands: [
        "Dark mode / Light mode",
        "Change theme",
        "Floating navigation",
        "Sidebar layout",
        "Logout",
      ],
    },
  ];

  // Add admin commands if user is admin
  if (user?.role === "Admin") {
    commandCategories.push({
      icon: Shield,
      title: "Admin Commands",
      color: "from-yellow-500 to-amber-500",
      commands: [
        "Create new user",
        "Show all users",
        "Manage users",
        "Filter users by role",
      ],
    });
  }

  if (!isSupported) return null;

  return (
    <>
      <VoiceIndicator isListening={isListening} transcript={transcript} />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.6 }}
        className="fixed bottom-6 left-6 z-40 flex flex-col gap-3"
      >
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.3, 1] }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-red-500/40 via-pink-500/40 to-red-500/40 rounded-full blur-xl"
            />
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="relative">
          <Button
            onClick={handleVoiceToggle}
            size="lg"
            className={`h-16 w-16 rounded-full shadow-2xl transition-all relative overflow-hidden ${
              isListening
                ? "bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                : "bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            }`}
          >
            {isListening && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-white rounded-full"
              />
            )}

            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="listening"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  className="relative z-10"
                >
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    <Mic className="h-7 w-7 text-white" />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  className="relative z-10"
                >
                  <MicOff className="h-7 w-7 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge className="h-7 w-7 rounded-full p-0 flex items-center justify-center bg-red-500 border-2 border-background">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Info Button */}
        <Dialog open={showCommands} onOpenChange={setShowCommands}>
          <DialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Button
                size="sm"
                className="h-12 w-12 rounded-full shadow-xl bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 relative overflow-hidden"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20"
                />
                <Info className="h-5 w-5 text-white relative z-10" />
              </Button>
            </motion.div>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden border-2 border-primary/20">
            <div className="relative bg-gradient-to-br from-background via-background to-primary/5">
              {/* Animated background */}
              <div className="absolute inset-0 overflow-hidden opacity-30">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [90, 0, 90],
                  }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
                />
              </div>

              <DialogHeader className="p-6 pb-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                  >
                    <Sparkles className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Voice Commands
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      Say any of these commands to control your CRM hands-free
                    </DialogDescription>
                  </div>
                </div>

                {/* User Role Badge */}
                <div className="flex items-center gap-2 mt-3">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-3 py-1">
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.role || "User"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Commands available based on your role
                  </span>
                </div>
              </DialogHeader>

              <ScrollArea className="h-[calc(85vh-180px)] px-6 pb-6 relative z-10">
                <div className="grid gap-4 md:grid-cols-2">
                  {commandCategories.map((category, idx) => (
                    <motion.div
                      key={category.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group"
                    >
                      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                        {/* Gradient overlay on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        
                        <div className="p-4 relative z-10">
                          {/* Category Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                              <category.icon className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">
                              {category.title}
                            </h3>
                          </div>

                          {/* Commands List */}
                          <div className="space-y-2">
                            {category.commands.map((command, cmdIdx) => (
                              <motion.div
                                key={cmdIdx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 + cmdIdx * 0.05 }}
                                className="flex items-start gap-2 text-sm"
                              >
                                <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${category.color} mt-1.5 shrink-0`} />
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                  "{command}"
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pro Tips Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 p-4 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm"
                >
                  <h4 className="font-bold text-base mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>Speak clearly and at a normal pace for best recognition</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>Wait for the confirmation toast to see if the command was executed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>Use exact command phrases for best accuracy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>Some commands require specific permissions based on your role</span>
                    </li>
                  </ul>
                </motion.div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </>
  );
};


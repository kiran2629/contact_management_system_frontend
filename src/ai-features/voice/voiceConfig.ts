export const voiceConfig = {
  language: "en-US",
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
  autoStopTimeout: 3000,
  confidenceThreshold: 0.5,
};

export const commandCategories = {
  navigation: [
    "open dashboard", "show dashboard", "go to dashboard",
    "open contacts", "show contacts", "view contacts",
    "open settings", "show settings",
    "open profile", "show profile",
    "open admin", "show admin",
    "open activity logs", "show activity",
    "go back", "go home",
  ],
  search: [
    "search for {query}", "find {query}", "look for {query}",
  ],
  actions: [
    "add contact", "create contact", "new contact",
    "logout", "log out", "sign out",
  ],
  ui: [
    "change theme", "toggle theme", "dark mode", "light mode",
    "change layout", "switch layout",
  ],
  filters: [
    "show marketing contacts", "show sales contacts",
    "filter by marketing", "filter by sales",
  ],
};


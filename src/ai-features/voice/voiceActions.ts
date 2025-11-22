import { NavigateFunction } from "react-router-dom";
import { AppDispatch } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { toggleTheme } from "@/store/slices/themeSlice";
import { setLayout } from "@/store/slices/layoutSlice";
import { VoiceCommand, VoiceActionResult } from "./types";

export class VoiceActionHandler {
  private navigate: NavigateFunction;
  private dispatch: AppDispatch;
  private user: any | null = null;

  constructor(navigate: NavigateFunction, dispatch: AppDispatch, user?: any) {
    this.navigate = navigate;
    this.dispatch = dispatch;
    this.user = user || null;
  }
  
  // Set user context for permission checking
  setUser(user: any) {
    this.user = user;
  }
  
  // Permission helpers
  private canCreate(): boolean {
    return this.user?.permissions?.contact?.create !== false;
  }
  
  private canUpdate(): boolean {
    return this.user?.permissions?.contact?.update !== false;
  }
  
  private canDelete(): boolean {
    return this.user?.permissions?.contact?.delete !== false;
  }
  
  private isAdmin(): boolean {
    return this.user?.role === "Admin";
  }
  
  private canViewStats(): boolean {
    return this.user?.permissions?.crm_features?.view_statistics !== false;
  }
  
  private canExport(): boolean {
    return this.user?.permissions?.crm_features?.export_contacts !== false;
  }
  
  private hasAccessToCategory(category: string): boolean {
    if (!this.user || !this.user.allowed_categories) return true; // Default allow if no restrictions
    return this.user.allowed_categories.includes(category);
  }

  getCommands(): VoiceCommand[] {
    return [
      // ============= NAVIGATION =============
      { pattern: /^(open|show|go to|view) dashboard$/i, type: "navigate", handler: () => this.handleDashboard(), description: "Open dashboard" },
      { pattern: /^(open|show|view) contacts$/i, type: "navigate", handler: () => this.navigateTo("/contacts"), description: "Open contacts" },
      { pattern: /^(open|show|view) settings$/i, type: "navigate", handler: () => this.navigateTo("/settings"), description: "Open settings" },
      { pattern: /^(open|show|view) profile$/i, type: "navigate", handler: () => this.navigateTo("/profile"), description: "Open profile" },
      { pattern: /^(open|show|view) activity logs?$/i, type: "navigate", handler: () => this.navigateTo("/activity-logs"), description: "Open activity logs" },
      { pattern: /^(open|show|view) admin$/i, type: "navigate", handler: () => this.handleAdminAccess(), description: "Open admin" },
      { pattern: /^(manage|show) users$/i, type: "navigate", handler: () => this.handleAdminAccess(), description: "Manage users" },
      { pattern: /^(go back|back)$/i, type: "navigate", handler: () => this.goBack(), description: "Go back" },
      { pattern: /^(go home|home)$/i, type: "navigate", handler: () => this.navigateTo("/dashboard"), description: "Go home" },
      
      // ============= SEARCH & FILTER =============
      { pattern: /^(search for|find|look for|show me) (.+)$/i, type: "search", handler: (matches) => this.searchContacts(matches?.[2] || ""), description: "Search contacts" },
      { pattern: /^(show|filter) marketing contacts$/i, type: "filter", handler: () => this.handleCategoryFilter("Marketing"), description: "Show marketing contacts" },
      { pattern: /^(show|filter) sales contacts$/i, type: "filter", handler: () => this.handleCategoryFilter("Sales"), description: "Show sales contacts" },
      { pattern: /^(show|filter) client contacts$/i, type: "filter", handler: () => this.handleCategoryFilter("Client"), description: "Show client contacts" },
      { pattern: /^(show|filter) vendor contacts$/i, type: "filter", handler: () => this.handleCategoryFilter("Vendor"), description: "Show vendor contacts" },
      { pattern: /^(show|filter) (.+) contacts$/i, type: "filter", handler: (matches) => this.handleCategoryFilter(matches?.[2] || ""), description: "Filter by category" },
      { pattern: /^(show|view) all contacts$/i, type: "action", handler: () => this.navigate("/contacts"), description: "Show all contacts" },
      
      // ============= ANALYTICS & INSIGHTS =============
      { pattern: /^(show|view) statistics$/i, type: "action", handler: () => this.handleStatistics(), description: "Show statistics" },
      { pattern: /^(how many|count) contacts?$/i, type: "action", handler: () => this.handleContactCount(), description: "Count contacts" },
      { pattern: /^(show|view) distribution$/i, type: "action", handler: () => this.handleDistribution(), description: "Show contact distribution" },
      { pattern: /^(show|view) top contacts$/i, type: "action", handler: () => this.handleTopContacts(), description: "Show top contacts" },
      { pattern: /^(show|view) data quality$/i, type: "action", handler: () => this.handleDataQuality(), description: "Check data quality" },
      
      // ============= BIRTHDAYS & REMINDERS =============
      { pattern: /^(show|view) (upcoming )?birthdays?$/i, type: "action", handler: () => this.handleBirthdays(), description: "Show upcoming birthdays" },
      { pattern: /^(who needs|show|view) follow ?up?s?$/i, type: "action", handler: () => this.handleFollowUps(), description: "Show follow-ups needed" },
      { pattern: /^(show|view) inactive contacts$/i, type: "action", handler: () => this.handleInactiveContacts(), description: "Show inactive contacts" },
      
      // ============= DATA MANAGEMENT =============
      { pattern: /^(find|check) duplicates$/i, type: "action", handler: () => this.handleDuplicates(), description: "Find duplicate contacts" },
      { pattern: /^export contacts$/i, type: "action", handler: () => this.handleExport(), description: "Export contacts" },
      { pattern: /^(add|create|new) contact$/i, type: "create", handler: () => this.handleCreateContact(), description: "Create contact" },
      { pattern: /^(show|view) recent contacts$/i, type: "action", handler: () => this.handleRecentContacts(), description: "Show recent contacts" },
      
      // ============= SORTING =============
      { pattern: /^sort by name$/i, type: "action", handler: () => this.handleSort("name"), description: "Sort by name" },
      { pattern: /^sort by company$/i, type: "action", handler: () => this.handleSort("company"), description: "Sort by company" },
      { pattern: /^sort by date$/i, type: "action", handler: () => this.handleSort("date"), description: "Sort by date" },
      { pattern: /^sort by score$/i, type: "action", handler: () => this.handleSort("leadScore"), description: "Sort by lead score" },
      
      // ============= UI CONTROLS =============
      { pattern: /^(logout|log out|sign out)$/i, type: "action", handler: () => this.handleLogout(), description: "Logout" },
      { pattern: /^(change|toggle|switch) theme$/i, type: "ui", handler: () => this.handleThemeToggle(), description: "Toggle theme" },
      { pattern: /^dark mode$/i, type: "ui", handler: () => this.handleThemeToggle(), description: "Dark mode" },
      { pattern: /^light mode$/i, type: "ui", handler: () => this.handleThemeToggle(), description: "Light mode" },
      { pattern: /^floating (navigation|layout)$/i, type: "ui", handler: () => this.dispatch(setLayout("floating")), description: "Floating navigation" },
      { pattern: /^sidebar layout$/i, type: "ui", handler: () => this.dispatch(setLayout("sidebar")), description: "Sidebar layout" },
      { pattern: /^minimal layout$/i, type: "ui", handler: () => this.dispatch(setLayout("minimal")), description: "Minimal layout" },
      { pattern: /^bottom bar layout$/i, type: "ui", handler: () => this.dispatch(setLayout("bottomBar")), description: "Bottom bar layout" },
      
      // ============= ADMIN COMMANDS =============
      { pattern: /^create (new )?user$/i, type: "admin", handler: () => this.handleCreateUser(), description: "Create new user (Admin only)" },
      { pattern: /^(show|view) (all )?users$/i, type: "admin", handler: () => this.handleAdminAccess(), description: "View all users" },
      { pattern: /^filter users by role$/i, type: "admin", handler: () => this.handleUserFilter(), description: "Filter users by role" },
    ];
  }

  processCommand(transcript: string): VoiceActionResult {
    const cleanTranscript = transcript.trim().toLowerCase();
    const commands = this.getCommands();

    for (const command of commands) {
      const matches = cleanTranscript.match(command.pattern instanceof RegExp ? command.pattern : new RegExp(`^${command.pattern}$`, "i"));
      if (matches) {
        try {
          command.handler(Array.from(matches));
          return { success: true, message: `Executing: ${command.description}`, action: command.type };
        } catch (error) {
          return { success: false, message: "Failed to execute command" };
        }
      }
    }

    return { success: false, message: "Command not recognized" };
  }

  private navigateTo(path: string) {
    this.navigate(path);
  }

  private goBack() {
    this.navigate(-1 as any);
  }

  private searchContacts(query: string) {
    this.navigate(`/contacts?search=${encodeURIComponent(query)}`);
  }

  private handleDashboard() {
    if (!this.canViewStats()) {
      throw new Error(`You don't have permission to view dashboard statistics. Your role is ${this.user?.role}.`);
    }
    this.navigateTo("/dashboard");
  }

  private handleAdminAccess() {
    if (!this.isAdmin()) {
      throw new Error(`User management is only available to Admins. Your role is ${this.user?.role}.`);
    }
    this.navigateTo("/admin/users");
  }

  private handleCreateContact() {
    if (!this.canCreate()) {
      throw new Error(`You don't have permission to create contacts. Your role is ${this.user?.role}.`);
    }
    this.navigateTo("/contacts/new");
  }

  private handleCategoryFilter(category: string) {
    if (!this.hasAccessToCategory(category)) {
      throw new Error(`You don't have access to ${category} category. Allowed categories: ${this.user?.allowed_categories?.join(", ") || "None"}.`);
    }
    this.filterByCategory(category);
  }

  private handleStatistics() {
    if (!this.canViewStats()) {
      throw new Error(`You don't have permission to view statistics.`);
    }
    this.navigateTo("/dashboard");
  }

  private handleExport() {
    if (!this.canExport()) {
      throw new Error(`You don't have permission to export contacts.`);
    }
    throw new Error("Export feature requires additional implementation.");
  }

  private filterByCategory(category: string) {
    this.navigate(`/contacts?category=${encodeURIComponent(category)}`);
  }

  private handleThemeToggle() {
    this.dispatch(toggleTheme());
  }

  private handleLogout() {
    this.dispatch(logout());
    this.navigate("/login");
  }

  // ============= PREMIUM HANDLER FUNCTIONS =============

  private handleContactCount() {
    if (!this.canViewStats()) {
      throw new Error(`You don't have permission to view contact statistics.`);
    }
    // Navigate to dashboard which shows the count
    this.navigateTo("/dashboard");
  }

  private handleDistribution() {
    if (!this.canViewStats()) {
      throw new Error(`You don't have permission to view analytics.`);
    }
    // Navigate to dashboard which shows distribution
    this.navigateTo("/dashboard");
  }

  private handleTopContacts() {
    if (!this.canViewStats()) {
      throw new Error(`You don't have permission to view top contacts.`);
    }
    // Navigate to contacts sorted by lead score
    this.navigate("/contacts?sort=leadScore");
  }

  private handleDataQuality() {
    if (!this.canViewStats()) {
      throw new Error(`You don't have permission to check data quality.`);
    }
    // Navigate to dashboard or contacts page
    this.navigateTo("/dashboard");
  }

  private handleBirthdays() {
    if (!this.user?.permissions?.crm_features?.view_birthdays) {
      throw new Error(`You don't have permission to view birthdays.`);
    }
    // Navigate to contacts filtered by upcoming birthdays
    this.navigate("/contacts?filter=birthdays");
  }

  private handleFollowUps() {
    if (!this.canViewStats()) {
      throw new Error(`You don't have permission to view follow-ups.`);
    }
    // Navigate to contacts filtered by follow-up needed
    this.navigate("/contacts?filter=followup");
  }

  private handleInactiveContacts() {
    if (!this.canViewStats()) {
      throw new Error(`You don't have permission to view inactive contacts.`);
    }
    // Navigate to contacts filtered by inactive
    this.navigate("/contacts?filter=inactive");
  }

  private handleDuplicates() {
    if (!this.canViewStats()) {
      throw new Error(`You don't have permission to find duplicates.`);
    }
    // Navigate to dashboard or special duplicate view
    this.navigateTo("/dashboard");
  }

  private handleRecentContacts() {
    // Navigate to contacts sorted by recent
    this.navigate("/contacts?sort=recent");
  }

  private handleSort(field: string) {
    // Navigate to contacts with sort parameter
    this.navigate(`/contacts?sort=${field}`);
  }

  private handleCreateUser() {
    if (!this.isAdmin()) {
      throw new Error(`Creating users is only available to Admins. Your role is ${this.user?.role}.`);
    }
    // Navigate to admin users with create dialog open
    this.navigate("/admin/users?action=create");
  }

  private handleUserFilter() {
    if (!this.isAdmin()) {
      throw new Error(`User filtering is only available to Admins.`);
    }
    // Navigate to admin users
    this.navigateTo("/admin/users");
  }
}


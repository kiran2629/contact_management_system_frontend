import { assistantConfig, SYSTEM_CATEGORIES, USER_ROLES } from "./assistantConfig";
import { AIResponse, ChatMessage, UserContext, ContactContext } from "./types";

// Enhanced AI Service with deep CRM understanding
export class AssistantService {
  private config = assistantConfig;
  private conversationHistory: ChatMessage[] = [];
  private userContext: UserContext | null = null;
  private contactsContext: ContactContext[] = [];

  constructor() {
    // Initialize with system prompt
    this.conversationHistory.push({
      id: "system",
      role: "system",
      content: this.config.systemPrompt,
      timestamp: new Date(),
    });
  }

  // Set user context for permission-aware responses
  setUserContext(user: UserContext) {
    this.userContext = user;
    console.log("AI Assistant - User Context Set:", {
      role: user.role,
      allowed_categories: user.allowed_categories,
      has_create_permission: user.permissions?.contact?.create,
      has_update_permission: user.permissions?.contact?.update,
      has_delete_permission: user.permissions?.contact?.delete,
    });
  }

  // Set contacts context for smarter suggestions
  setContactsContext(contacts: ContactContext[]) {
    this.contactsContext = contacts;
  }

  // Enhanced message sending with context
  async sendMessage(userMessage: string, context?: {
    currentPage?: string;
    selectedCategory?: string;
    searchQuery?: string;
    recentStats?: any;
    contacts?: any[];
    allUsers?: any[];
    dashboardData?: any;
  }): Promise<AIResponse> {
    try {
      // Add user message to history
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };
      this.conversationHistory.push(userMsg);

      // Build context-aware prompt
      const contextPrompt = this.buildContextPrompt(userMessage, context);

      // Call appropriate AI provider
      let aiResponse: AIResponse;

      if (this.config.apiKey) {
        switch (this.config.provider) {
          case "openai":
            aiResponse = await this.callOpenAI(contextPrompt);
            break;
          case "anthropic":
            aiResponse = await this.callAnthropic(contextPrompt);
            break;
          case "local":
            aiResponse = await this.callLocalLLM(contextPrompt);
            break;
          default:
            aiResponse = await this.callOpenAI(contextPrompt);
        }
      } else {
        // Enhanced fallback with intelligent pattern matching
        aiResponse = this.getIntelligentFallback(userMessage, context);
      }

      // Add assistant response to history
      const assistantMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: aiResponse.message,
        timestamp: new Date(),
        actions: aiResponse.actions,
        data: aiResponse.data,
      };
      this.conversationHistory.push(assistantMsg);

      return aiResponse;
    } catch (error) {
      console.error("AI Assistant Error:", error);
      return this.getErrorFallback(userMessage);
    }
  }

  // Build context-aware prompt with permission checking
  private buildContextPrompt(userMessage: string, context?: any): string {
    let prompt = userMessage;

    // Add user context with detailed permissions
    if (this.userContext) {
      prompt += `\n\n**Current User Context (CRITICAL - Respect These Permissions):**\n`;
      prompt += `- Role: ${this.userContext.role}\n`;
      
      // Role-specific restrictions
      if (this.userContext.role === "Admin") {
        prompt += `- Access Level: FULL ACCESS (can see all contacts, manage users, all features)\n`;
      } else if (this.userContext.role === "HR") {
        prompt += `- Access Level: LIMITED (can see specific categories, cannot manage users)\n`;
      } else {
        prompt += `- Access Level: RESTRICTED (can only see assigned categories, limited features)\n`;
      }
      
      prompt += `- Allowed Categories: ${this.userContext.allowed_categories.join(", ")}\n`;
      
      // Permission details
      if (this.userContext.permissions) {
        const contactPerms = this.userContext.permissions.contact || {};
        const notePerms = this.userContext.permissions.notes || {};
        const crmPerms = this.userContext.permissions.crm_features || {};
        
        prompt += `\n**Contact Permissions:**\n`;
        prompt += `- Can Create: ${contactPerms.create ? "YES" : "NO - Do NOT suggest creating contacts"}\n`;
        prompt += `- Can Read: ${contactPerms.read ? "YES" : "NO"}\n`;
        prompt += `- Can Update: ${contactPerms.update ? "YES" : "NO - Do NOT suggest editing contacts"}\n`;
        prompt += `- Can Delete: ${contactPerms.delete ? "YES" : "NO - Do NOT suggest deleting contacts"}\n`;
        
        prompt += `\n**Notes Permissions:**\n`;
        prompt += `- Can Create Notes: ${notePerms.create ? "YES" : "NO"}\n`;
        prompt += `- Can Update Notes: ${notePerms.update ? "YES" : "NO"}\n`;
        
        prompt += `\n**CRM Features:**\n`;
        prompt += `- View Statistics: ${crmPerms.view_statistics ? "YES" : "NO - Do NOT show stats"}\n`;
        prompt += `- Export Contacts: ${crmPerms.export_contacts ? "YES" : "NO - Do NOT suggest export"}\n`;
        prompt += `- Import Contacts: ${crmPerms.import_contacts ? "YES" : "NO"}\n`;
      }
      
      // Explicit restrictions
      prompt += `\n**IMPORTANT RESTRICTIONS:**\n`;
      if (this.userContext.role !== "Admin") {
        prompt += `- NEVER suggest user management (only Admin can manage users)\n`;
        prompt += `- NEVER suggest admin panel access\n`;
      }
      prompt += `- ONLY suggest contacts from these categories: ${this.userContext.allowed_categories.join(", ")}\n`;
      prompt += `- ALWAYS check permissions before suggesting any action\n`;
    }

    // Add page context
    if (context?.currentPage) {
      prompt += `\n- Current Page: ${context.currentPage}\n`;
    }

    // Add search context
    if (context?.searchQuery) {
      prompt += `\n- Current Search: "${context.searchQuery}"\n`;
    }

    // Add category context
    if (context?.selectedCategory) {
      prompt += `\n- Selected Category: ${context.selectedCategory}\n`;
    }

    // Add stats context
    if (context?.recentStats) {
      prompt += `\n- Dashboard Stats: ${JSON.stringify(context.recentStats)}\n`;
    }

    // Add contacts summary (filtered by allowed categories)
    if (this.contactsContext.length > 0) {
      const allowedContacts = this.userContext 
        ? this.contactsContext.filter(c => 
            c.categories.some(cat => this.userContext!.allowed_categories.includes(cat))
          )
        : this.contactsContext;
      
      prompt += `\n- Total Contacts User Can Access: ${allowedContacts.length}\n`;
      
      const categoryCount: Record<string, number> = {};
      allowedContacts.forEach(c => {
        c.categories.forEach(cat => {
          if (!this.userContext || this.userContext.allowed_categories.includes(cat)) {
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
          }
        });
      });
      prompt += `- Contacts by Category (only allowed): ${JSON.stringify(categoryCount)}\n`;
    }

    return prompt;
  }

  // OpenAI API call
  private async callOpenAI(message: string): Promise<AIResponse> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || "gpt-4o-mini",
        messages: [
          { role: "system", content: this.config.systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }, // Force JSON response
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || "{}";

    try {
      const parsed = JSON.parse(aiMessage);
      return {
        message: parsed.message || aiMessage,
        actions: parsed.actions || [],
        data: parsed.data,
      };
    } catch {
      // If not JSON, wrap in proper format
      return {
        message: aiMessage,
        actions: [],
      };
    }
  }

  // Anthropic API call
  private async callAnthropic(message: string): Promise<AIResponse> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model || "claude-3-5-sonnet-20241022",
        max_tokens: 800,
        system: this.config.systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiMessage = data.content[0]?.text || "{}";

    try {
      const parsed = JSON.parse(aiMessage);
      return {
        message: parsed.message || aiMessage,
        actions: parsed.actions || [],
        data: parsed.data,
      };
    } catch {
      return {
        message: aiMessage,
        actions: [],
      };
    }
  }

  // Local LLM call
  private async callLocalLLM(message: string): Promise<AIResponse> {
    const endpoint = this.config.endpoint || "http://localhost:11434/api/chat";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.config.model || "llama3.2",
        messages: [
          { role: "system", content: this.config.systemPrompt },
          { role: "user", content: message }
        ],
        stream: false,
        format: "json", // Request JSON format
      }),
    });

    if (!response.ok) {
      throw new Error(`Local LLM error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiMessage = data.message?.content || "{}";

    try {
      const parsed = JSON.parse(aiMessage);
      return {
        message: parsed.message || aiMessage,
        actions: parsed.actions || [],
        data: parsed.data,
      };
    } catch {
      return {
        message: aiMessage,
        actions: [],
      };
    }
  }

  // Intelligent fallback (no API key) - Permission-aware WITH REAL DATA
  private getIntelligentFallback(message: string, context?: any): AIResponse {
    const lowerMessage = message.toLowerCase();
    
    // Extract real data from context
    const contacts = context?.contacts || [];
    const allUsers = context?.allUsers || [];
    const dashboardData = context?.dashboardData;
    
    // Check permissions first
    const canCreate = this.userContext?.permissions?.contact?.create !== false;
    const canUpdate = this.userContext?.permissions?.contact?.update !== false;
    const canDelete = this.userContext?.permissions?.contact?.delete !== false;
    const isAdmin = this.userContext?.role === "Admin";
    const canViewStats = this.userContext?.permissions?.crm_features?.view_statistics !== false;
    
    // ============= REAL DATA QUERIES =============
    
    // Search for specific contact by name/company/email
    if (this.matchesPattern(lowerMessage, ["find", "search for", "show me", "who is", "look for"])) {
      const searchTerm = this.extractSearchTerm(message) || message.replace(/^(find|search for|show me|who is|look for)\s+/i, "").trim();
      
      if (searchTerm && contacts.length > 0) {
        const results = contacts.filter((c: any) => 
          c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (results.length > 0) {
          const formattedResults = this.formatContactResults(results.slice(0, 10));
          return {
            message: `Found ${results.length} contact${results.length > 1 ? 's' : ''} matching "${searchTerm}":\n\n${formattedResults}`,
            actions: results.slice(0, 5).map((c: any) => ({
              type: "view_contact",
              label: `View ${c.name}`,
              params: { id: c.id }
            })),
            data: { contacts: results }
          };
        } else {
          return {
            message: `No contacts found matching "${searchTerm}". Would you like to create a new contact?`,
            actions: canCreate ? [{
              type: "create_contact",
              label: "Create New Contact",
              params: {}
            }] : [],
          };
        }
      }
    }
    
    // Show contacts from specific company
    if (this.matchesPattern(lowerMessage, ["from company", "at company", "works at", "employees at"])) {
      const company = this.extractCompany(message);
      if (company && contacts.length > 0) {
        const results = contacts.filter((c: any) => 
          c.company?.toLowerCase().includes(company.toLowerCase())
        );
        
        if (results.length > 0) {
          const formattedResults = this.formatContactResults(results);
          return {
            message: `Found ${results.length} contact${results.length > 1 ? 's' : ''} at ${company}:\n\n${formattedResults}`,
            actions: results.slice(0, 5).map((c: any) => ({
              type: "view_contact",
              label: `View ${c.name}`,
              params: { id: c.id }
            })),
            data: { contacts: results }
          };
        }
      }
    }
    
    // Show users (Admin only)
    if (isAdmin && this.matchesPattern(lowerMessage, ["show users", "list users", "all users", "how many users"])) {
      if (allUsers.length > 0) {
        const formattedUsers = this.formatUserResults(allUsers);
        const breakdown = {
          total: allUsers.length,
          admin: allUsers.filter((u: any) => u.role === "Admin").length,
          hr: allUsers.filter((u: any) => u.role === "HR").length,
          user: allUsers.filter((u: any) => u.role === "User").length,
        };
        
        return {
          message: `**System Users (${allUsers.length} total)**\n\n📊 **Breakdown:**\n• Admins: ${breakdown.admin}\n• HR: ${breakdown.hr}\n• Users: ${breakdown.user}\n\n${formattedUsers}`,
          actions: [{
            type: "navigate",
            label: "Manage Users",
            params: { path: "/admin/users" }
          }],
          data: { users: allUsers, breakdown }
        };
      }
    }
    
    // Dashboard stats with real data
    if (this.matchesPattern(lowerMessage, ["dashboard", "stats", "statistics", "overview", "summary"]) && dashboardData) {
      const stats = this.formatDashboardStats(dashboardData, contacts.length);
      return {
        message: stats,
        actions: [{
          type: "navigate",
          label: "View Full Dashboard",
          params: { path: "/dashboard" }
        }],
        data: { stats: dashboardData }
      };
    }
    
    // Contact count with real data
    if (this.matchesPattern(lowerMessage, ["how many contacts", "total contacts", "count contacts", "number of contacts"])) {
      const categoryBreakdown = this.getCategoryDistributionFromData(contacts);
      return {
        message: `📊 **Your Contact Statistics**\n\n**Total Contacts:** ${contacts.length}\n\n**By Category:**\n${categoryBreakdown}\n\n**By Company:** ${new Set(contacts.map((c: any) => c.company)).size} unique companies`,
        actions: [{
          type: "show_stats",
          label: "View Dashboard",
          params: { type: "dashboard" }
        }],
        data: { total: contacts.length }
      };
    }

    // Search patterns
    if (this.matchesPattern(lowerMessage, ["search", "find", "look for", "show me"])) {
      const searchTerm = this.extractSearchTerm(message);
      return {
        message: searchTerm 
          ? `I'll search for "${searchTerm}" in your contacts.`
          : "What would you like to search for?",
        actions: searchTerm ? [{
          type: "search_contacts",
          label: `Search: ${searchTerm}`,
          params: { query: searchTerm }
        }] : [],
      };
    }

    // Category filters
    const category = this.detectCategory(lowerMessage);
    if (category) {
      return {
        message: `I'll show you all contacts in the ${category} category.`,
        actions: [{
          type: "filter_category",
          label: `Show ${category} Contacts`,
          params: { category }
        }],
      };
    }

    // Navigation
    const navTarget = this.detectNavigation(lowerMessage);
    if (navTarget) {
      return {
        message: `Opening ${navTarget.label} for you.`,
        actions: [{
          type: "navigate",
          label: `Go to ${navTarget.label}`,
          params: { path: navTarget.path }
        }],
      };
    }

    // Create contact (permission check)
    if (this.matchesPattern(lowerMessage, ["create", "add", "new contact"])) {
      if (!canCreate) {
        return {
          message: `Sorry, you don't have permission to create contacts. Your role (${this.userContext?.role}) doesn't allow this action.`,
          actions: [{
            type: "navigate",
            label: "View Existing Contacts",
            params: { path: "/contacts" }
          }],
        };
      }
      
      return {
        message: "I'll open the form to create a new contact.",
        actions: [{
          type: "create_contact",
          label: "Create New Contact",
          params: {}
        }],
      };
    }

    // Statistics (permission check)
    if (this.matchesPattern(lowerMessage, ["stats", "statistics", "dashboard", "overview", "summary"])) {
      if (!canViewStats) {
        return {
          message: `You don't have permission to view detailed statistics. You can still see your contacts.`,
          actions: [{
            type: "navigate",
            label: "View Your Contacts",
            params: { path: "/contacts" }
          }],
        };
      }
      
      return {
        message: "I'll show you your dashboard statistics.",
        actions: [
          {
            type: "navigate",
            label: "View Dashboard",
            params: { path: "/dashboard" }
          },
          {
            type: "show_stats",
            label: "Show Statistics",
            params: { type: "dashboard" }
          }
        ],
      };
    }
    
    // User management (Admin only)
    if (this.matchesPattern(lowerMessage, ["user management", "manage users", "admin panel", "users"])) {
      if (!isAdmin) {
        return {
          message: `User management is only available to Admins. Your role (${this.userContext?.role}) doesn't have access to this feature.`,
          actions: [{
            type: "navigate",
            label: "View Your Dashboard",
            params: { path: "/dashboard" }
          }],
        };
      }
      
      return {
        message: "I'll open the user management panel for you.",
        actions: [{
          type: "navigate",
          label: "Manage Users",
          params: { path: "/admin/users" }
        }],
      };
    }

    // ============= PREMIUM ANALYTICS FEATURES =============
    
    // Contact Distribution Analytics
    if (this.matchesPattern(lowerMessage, ["distribution", "breakdown", "how many in each", "contact split"])) {
      const categoryBreakdown = this.getCategoryDistribution();
      return {
        message: `Here's your contact distribution:\n${categoryBreakdown.summary}`,
        actions: [{
          type: "show_analytics",
          label: "View Detailed Analytics",
          params: { type: "distribution" }
        }],
        data: { breakdown: categoryBreakdown.data }
      };
    }

    // Top/High-Value Contacts
    if (this.matchesPattern(lowerMessage, ["top contacts", "best contacts", "high value", "important", "vip", "lead score"])) {
      const topContacts = this.getTopContacts();
      return {
        message: `Here are your highest-value contacts:\n${topContacts.summary}`,
        actions: [{
          type: "show_top_contacts",
          label: "View All Top Contacts",
          params: { by: "leadScore" }
        }],
        data: { contacts: topContacts.data }
      };
    }

    // Birthday Reminders
    if (this.matchesPattern(lowerMessage, ["birthday", "birthdays", "upcoming birthday"])) {
      const birthdays = this.getUpcomingBirthdays();
      return {
        message: birthdays.count > 0 
          ? `Found ${birthdays.count} upcoming birthdays in the next 30 days:\n${birthdays.summary}`
          : "No birthdays coming up in the next 30 days.",
        actions: birthdays.count > 0 ? [{
          type: "show_birthdays",
          label: "View All Birthdays",
          params: { days: 30 }
        }] : [],
        data: { birthdays: birthdays.data }
      };
    }

    // Follow-up Suggestions
    if (this.matchesPattern(lowerMessage, ["follow up", "followup", "haven't contacted", "reach out", "check in"])) {
      const followUps = this.getFollowUpSuggestions();
      return {
        message: followUps.count > 0
          ? `Found ${followUps.count} contacts that need follow-up:\n${followUps.summary}`
          : "All contacts are up to date!",
        actions: followUps.count > 0 ? [{
          type: "suggest_followups",
          label: "View Follow-up List",
          params: {}
        }] : [],
        data: { contacts: followUps.data }
      };
    }

    // Duplicate Detection
    if (this.matchesPattern(lowerMessage, ["duplicate", "duplicates", "same contact", "merge contacts"])) {
      const duplicates = this.findDuplicates();
      return {
        message: duplicates.count > 0
          ? `Found ${duplicates.count} potential duplicate contacts:\n${duplicates.summary}`
          : "No duplicate contacts found. Your data looks clean!",
        actions: duplicates.count > 0 ? [{
          type: "find_duplicates",
          label: "Review Duplicates",
          params: {}
        }] : [],
        data: { duplicates: duplicates.data }
      };
    }

    // Data Quality Check
    if (this.matchesPattern(lowerMessage, ["data quality", "incomplete", "missing info", "cleanup", "data health"])) {
      const quality = this.checkDataQuality();
      return {
        message: `Data Quality Report:\n${quality.summary}`,
        actions: [{
          type: "data_quality",
          label: "View Full Report",
          params: {}
        }],
        data: { quality: quality.data }
      };
    }

    // Recent Additions
    if (this.matchesPattern(lowerMessage, ["recent", "latest", "new contacts", "recently added"])) {
      const recent = this.getRecentContacts();
      return {
        message: `Your ${recent.count} most recent contacts:\n${recent.summary}`,
        actions: [{
          type: "show_analytics",
          label: "View All Recent",
          params: { type: "recent" }
        }],
        data: { contacts: recent.data }
      };
    }

    // Contact by Company
    if (this.matchesPattern(lowerMessage, ["from company", "at company", "company contacts", "organization"])) {
      const company = this.extractCompany(message);
      if (company) {
        return {
          message: `Searching for all contacts from ${company}...`,
          actions: [{
            type: "search_contacts",
            label: `Search: ${company}`,
            params: { query: company }
          }],
        };
      }
    }

    // Inactive Contacts
    if (this.matchesPattern(lowerMessage, ["inactive", "not contacted", "old contacts", "stale"])) {
      const inactive = this.getInactiveContacts();
      return {
        message: inactive.count > 0
          ? `Found ${inactive.count} contacts with no recent interaction:\n${inactive.summary}`
          : "All your contacts have recent interactions!",
        actions: inactive.count > 0 ? [{
          type: "advanced_search",
          label: "View Inactive Contacts",
          params: { criteria: { inactive: true } }
        }] : [],
        data: { contacts: inactive.data }
      };
    }

    // Export Suggestions
    if (this.matchesPattern(lowerMessage, ["export", "download", "backup", "csv", "excel"])) {
      if (!this.userContext?.permissions?.crm_features?.export_contacts) {
        return {
          message: `You don't have permission to export contacts. Contact your Admin to get export access.`,
          actions: [],
        };
      }
      
      return {
        message: "I can help you export your contacts in various formats.",
        actions: [{
          type: "export_data",
          label: "Export as CSV",
          params: { format: "csv" }
        }],
      };
    }

    // Bulk Operations (Update)
    if (this.matchesPattern(lowerMessage, ["bulk update", "mass update", "change all", "update multiple"])) {
      if (!canUpdate) {
        return {
          message: `You don't have permission to update contacts. Your role (${this.userContext?.role}) doesn't allow bulk updates.`,
          actions: [],
        };
      }
      
      return {
        message: "Bulk updates let you change multiple contacts at once. What field would you like to update?",
        actions: [{
          type: "bulk_update",
          label: "Start Bulk Update",
          params: {}
        }],
      };
    }

    // Contact Relationship Mapping
    if (this.matchesPattern(lowerMessage, ["connections", "related", "same company", "relationships", "network"])) {
      return {
        message: "I can show you how your contacts are connected - by company, shared notes, or interactions.",
        actions: [{
          type: "relationship_map",
          label: "View Contact Network",
          params: {}
        }],
      };
    }

    // Sort Contacts
    if (this.matchesPattern(lowerMessage, ["sort", "order by", "arrange"])) {
      let sortField = "name";
      if (lowerMessage.includes("date") || lowerMessage.includes("recent")) sortField = "lastInteraction";
      if (lowerMessage.includes("score")) sortField = "leadScore";
      if (lowerMessage.includes("company")) sortField = "company";
      
      return {
        message: `I'll sort your contacts by ${sortField}.`,
        actions: [{
          type: "sort_contacts",
          label: `Sort by ${sortField}`,
          params: { field: sortField, order: "desc" }
        }],
      };
    }

    // Contact Count/Stats
    if (this.matchesPattern(lowerMessage, ["how many", "count", "total contacts", "number of"])) {
      const stats = this.getContactStats();
      return {
        message: `📊 Your Contact Statistics:\n${stats.summary}`,
        actions: [{
          type: "show_stats",
          label: "View Dashboard",
          params: { type: "dashboard" }
        }],
        data: { stats: stats.data }
      };
    }

    // Help/What can you do
    if (this.matchesPattern(lowerMessage, ["help", "what can you do", "commands", "features", "capabilities"])) {
      return this.getHelpResponse();
    }

    // Default helpful response (permission-aware)
    const allowedActions = [`• **Search contacts**: "Find John Smith"`];
    
    if (this.userContext?.allowed_categories.length) {
      allowedActions.push(`• **Filter by category**: "Show ${this.userContext.allowed_categories[0]} contacts"`);
    }
    
    allowedActions.push(`• **Navigate**: "Open dashboard"`);
    
    if (canCreate) {
      allowedActions.push(`• **Create**: "Add new contact"`);
    }
    
    if (canViewStats) {
      allowedActions.push(`• **Statistics**: "Show me stats"`);
    }
    
    if (isAdmin) {
      allowedActions.push(`• **User Management**: "Manage users" (Admin only)`);
    }
    
    const actions: any[] = [
      {
        type: "navigate",
        label: "View Your Contacts",
        params: { path: "/contacts" }
      },
    ];
    
    if (canViewStats) {
      actions.push({
        type: "navigate",
        label: "Dashboard",
        params: { path: "/dashboard" }
      });
    }
    
    if (canCreate) {
      actions.push({
        type: "create_contact",
        label: "Create Contact",
        params: {}
      });
    }
    
    return {
      message: `I can help you with:\n\n${allowedActions.join("\n")}\n\n**Your Role**: ${this.userContext?.role || "User"}\n**Allowed Categories**: ${this.userContext?.allowed_categories.join(", ") || "None"}\n\nWhat would you like to do?`,
      actions,
    };
  }

  // Error fallback
  private getErrorFallback(message: string): AIResponse {
    return {
      message: "I'm having trouble processing your request right now. Here are some things I can help with:",
      actions: [
        {
          type: "search_contacts",
          label: "Search Contacts",
          params: { query: "" }
        },
        {
          type: "navigate",
          label: "View Dashboard",
          params: { path: "/dashboard" }
        }
      ],
    };
  }

  // Helper: Pattern matching
  private matchesPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  // Helper: Extract search term
  private extractSearchTerm(message: string): string {
    const patterns = [
      /(?:search for|find|look for|show me)\s+["']?([^"']+)["']?/i,
      /["']([^"']+)["']/,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return "";
  }

  // Helper: Detect category
  private detectCategory(text: string): string | null {
    for (const category of SYSTEM_CATEGORIES) {
      if (text.includes(category.toLowerCase())) {
        return category;
      }
    }
    return null;
  }

  // Helper: Detect navigation
  private detectNavigation(text: string): { path: string; label: string } | null {
    const navMap: Record<string, { path: string; label: string }> = {
      "dashboard": { path: "/dashboard", label: "Dashboard" },
      "contacts": { path: "/contacts", label: "Contacts" },
      "settings": { path: "/settings", label: "Settings" },
      "profile": { path: "/profile", label: "Profile" },
      "activity": { path: "/activity-logs", label: "Activity Logs" },
      "admin": { path: "/admin/users", label: "Admin Panel" },
    };

    for (const [key, value] of Object.entries(navMap)) {
      if (text.includes(key)) {
        return value;
      }
    }

    return null;
  }

  // ============= PREMIUM HELPER FUNCTIONS =============

  // Get category distribution
  private getCategoryDistribution(): { summary: string; data: any } {
    const allowed = this.userContext?.allowed_categories || [];
    const filtered = this.contactsContext.filter(c => 
      c.categories.some(cat => allowed.includes(cat))
    );
    
    const breakdown: Record<string, number> = {};
    filtered.forEach(c => {
      c.categories.forEach(cat => {
        if (allowed.includes(cat)) {
          breakdown[cat] = (breakdown[cat] || 0) + 1;
        }
      });
    });

    const summary = Object.entries(breakdown)
      .map(([cat, count]) => `• ${cat}: ${count} contacts`)
      .join("\n");

    return { summary: summary || "No contacts found", data: breakdown };
  }

  // Get top contacts by lead score
  private getTopContacts(limit: number = 5): { summary: string; data: any[]; count: number } {
    const allowed = this.userContext?.allowed_categories || [];
    const filtered = this.contactsContext.filter(c => 
      c.categories.some(cat => allowed.includes(cat)) && c.leadScore
    );
    
    const sorted = filtered
      .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0))
      .slice(0, limit);

    const summary = sorted.map((c, i) => 
      `${i + 1}. ${c.name} (${c.company}) - Score: ${c.leadScore}`
    ).join("\n");

    return { summary: summary || "No scored contacts", data: sorted, count: sorted.length };
  }

  // Get upcoming birthdays
  private getUpcomingBirthdays(days: number = 30): { summary: string; data: any[]; count: number } {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    const allowed = this.userContext?.allowed_categories || [];
    const filtered = this.contactsContext.filter(c => 
      c.categories.some(cat => allowed.includes(cat)) && c.birthday
    );

    const upcoming = filtered
      .filter(c => {
        const bday = new Date(c.birthday!);
        const thisYear = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
        return thisYear >= now && thisYear <= futureDate;
      })
      .sort((a, b) => {
        const aDate = new Date(a.birthday!);
        const bDate = new Date(b.birthday!);
        return aDate.getTime() - bDate.getTime();
      });

    const summary = upcoming.map(c => {
      const bday = new Date(c.birthday!);
      const daysUntil = Math.ceil((bday.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      return `• ${c.name} - ${bday.toLocaleDateString()} (in ${daysUntil} days)`;
    }).join("\n");

    return { summary, data: upcoming, count: upcoming.length };
  }

  // Get follow-up suggestions
  private getFollowUpSuggestions(days: number = 30): { summary: string; data: any[]; count: number } {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const allowed = this.userContext?.allowed_categories || [];
    const filtered = this.contactsContext.filter(c => 
      c.categories.some(cat => allowed.includes(cat)) && 
      c.lastInteraction && 
      new Date(c.lastInteraction) < cutoffDate
    );

    const summary = filtered.slice(0, 5).map(c => {
      const lastDate = new Date(c.lastInteraction!);
      const daysAgo = Math.floor((Date.now() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
      return `• ${c.name} (${c.company}) - Last contact: ${daysAgo} days ago`;
    }).join("\n");

    return { summary, data: filtered, count: filtered.length };
  }

  // Find duplicate contacts
  private findDuplicates(): { summary: string; data: any[]; count: number } {
    const allowed = this.userContext?.allowed_categories || [];
    const filtered = this.contactsContext.filter(c => 
      c.categories.some(cat => allowed.includes(cat))
    );

    const duplicates: any[] = [];
    const seen = new Map<string, any>();

    filtered.forEach(c => {
      const key = `${c.email?.toLowerCase()}|${c.phone}`;
      if (seen.has(key)) {
        duplicates.push({ original: seen.get(key), duplicate: c });
      } else {
        seen.set(key, c);
      }
    });

    const summary = duplicates.slice(0, 5).map((d, i) => 
      `${i + 1}. ${d.original.name} ↔ ${d.duplicate.name} (${d.original.email})`
    ).join("\n");

    return { summary, data: duplicates, count: duplicates.length };
  }

  // Check data quality
  private checkDataQuality(): { summary: string; data: any } {
    const allowed = this.userContext?.allowed_categories || [];
    const filtered = this.contactsContext.filter(c => 
      c.categories.some(cat => allowed.includes(cat))
    );

    const stats = {
      total: filtered.length,
      missingEmail: filtered.filter(c => !c.email).length,
      missingPhone: filtered.filter(c => !c.phone).length,
      missingAddress: filtered.filter(c => !c.address).length,
      noScore: filtered.filter(c => !c.leadScore).length,
      noNotes: filtered.filter(c => !c.notes || c.notes.length === 0).length,
    };

    const issues: string[] = [];
    if (stats.missingEmail > 0) issues.push(`• ${stats.missingEmail} missing emails`);
    if (stats.missingPhone > 0) issues.push(`• ${stats.missingPhone} missing phones`);
    if (stats.missingAddress > 0) issues.push(`• ${stats.missingAddress} missing addresses`);
    if (stats.noScore > 0) issues.push(`• ${stats.noScore} without lead scores`);
    if (stats.noNotes > 0) issues.push(`• ${stats.noNotes} without notes`);

    const quality = 100 - Math.round(
      ((stats.missingEmail + stats.missingPhone + stats.noScore) / (stats.total * 3)) * 100
    );

    const summary = `Overall Quality: ${quality}%\n\n${issues.length > 0 ? "Issues found:\n" + issues.join("\n") : "✅ Data looks great!"}`;

    return { summary, data: stats };
  }

  // Get recent contacts
  private getRecentContacts(limit: number = 5): { summary: string; data: any[]; count: number } {
    const allowed = this.userContext?.allowed_categories || [];
    const filtered = this.contactsContext.filter(c => 
      c.categories.some(cat => allowed.includes(cat))
    );

    const recent = [...filtered].slice(0, limit);
    const summary = recent.map((c, i) => 
      `${i + 1}. ${c.name} (${c.company})`
    ).join("\n");

    return { summary, data: recent, count: recent.length };
  }

  // Get inactive contacts
  private getInactiveContacts(days: number = 60): { summary: string; data: any[]; count: number } {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const allowed = this.userContext?.allowed_categories || [];
    const filtered = this.contactsContext.filter(c => 
      c.categories.some(cat => allowed.includes(cat)) &&
      (!c.lastInteraction || new Date(c.lastInteraction) < cutoffDate)
    );

    const summary = filtered.slice(0, 5).map((c, i) => 
      `${i + 1}. ${c.name} (${c.company})${c.lastInteraction ? ` - Last: ${new Date(c.lastInteraction).toLocaleDateString()}` : " - Never contacted"}`
    ).join("\n");

    return { summary, data: filtered, count: filtered.length };
  }

  // Extract company from message
  private extractCompany(message: string): string | null {
    const patterns = [
      /(?:from|at|company)\s+["']?([^"']+)["']?/i,
      /["']([^"']+)["']\s+company/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  // Get contact stats
  private getContactStats(): { summary: string; data: any } {
    const allowed = this.userContext?.allowed_categories || [];
    const filtered = this.contactsContext.filter(c => 
      c.categories.some(cat => allowed.includes(cat))
    );

    const categories = new Set<string>();
    const companies = new Set<string>();
    
    filtered.forEach(c => {
      c.categories.forEach(cat => categories.add(cat));
      if (c.company) companies.add(c.company);
    });

    const summary = `• Total Contacts: ${filtered.length}\n• Categories: ${categories.size}\n• Companies: ${companies.size}\n• Avg Lead Score: ${Math.round(filtered.reduce((sum, c) => sum + (c.leadScore || 0), 0) / filtered.length)}`;

    return { 
      summary, 
      data: { 
        total: filtered.length, 
        categories: categories.size, 
        companies: companies.size 
      } 
    };
  }

  // Get comprehensive help response
  private getHelpResponse(): AIResponse {
    const isAdmin = this.userContext?.role === "Admin";
    const canCreate = this.userContext?.permissions?.contact?.create !== false;
    const canViewStats = this.userContext?.permissions?.crm_features?.view_statistics !== false;

    const features = [
      "🔍 **Search**: \"Find John Smith\" or \"Search Acme Corp\"",
      "📊 **Analytics**: \"Show distribution\", \"Top contacts\", \"Data quality\"",
      "📅 **Birthdays**: \"Show upcoming birthdays\"",
      "📞 **Follow-ups**: \"Who needs follow-up?\"",
      "🔄 **Duplicates**: \"Find duplicate contacts\"",
      "📈 **Stats**: \"How many contacts?\", \"Show statistics\"",
      "🏷️ **Filter**: \"Show Marketing contacts\"",
      "🧹 **Data Quality**: \"Check data quality\"",
      "📍 **Navigation**: \"Open dashboard\", \"Go to settings\"",
    ];

    if (canCreate) {
      features.push("➕ **Create**: \"Add new contact\"");
    }

    if (canViewStats) {
      features.push("📥 **Export**: \"Export contacts\"");
    }

    if (isAdmin) {
      features.push("👥 **Admin**: \"Manage users\"");
    }

    return {
      message: `🤖 **AI Assistant Capabilities**\n\nI'm here to help you manage your CRM efficiently!\n\n${features.join("\n")}\n\n**Your Role**: ${this.userContext?.role}\n**Allowed Categories**: ${this.userContext?.allowed_categories.join(", ")}\n\nTry asking me anything!`,
      actions: [{
        type: "navigate",
        label: "View Dashboard",
        params: { path: "/dashboard" }
      }],
    };
  }

  // ============= DATA FORMATTING HELPERS =============

  // Format contact results for display in chat
  private formatContactResults(contacts: any[]): string {
    if (contacts.length === 0) return "No contacts found.";
    
    return contacts.slice(0, 10).map((contact, idx) => {
      const lines = [
        `**${idx + 1}. ${contact.name}**`,
        `   📧 ${contact.email || "No email"}`,
        `   📞 ${contact.phone || "No phone"}`,
        `   🏢 ${contact.company || "No company"}`,
        `   🏷️ ${contact.categories?.join(", ") || "No categories"}`,
      ];
      
      if (contact.leadScore) {
        lines.push(`   ⭐ Score: ${contact.leadScore}/100`);
      }
      
      return lines.join("\n");
    }).join("\n\n") + (contacts.length > 10 ? `\n\n_...and ${contacts.length - 10} more_` : "");
  }

  // Format user results for display in chat (Admin only)
  private formatUserResults(users: any[]): string {
    if (users.length === 0) return "No users found.";
    
    return users.slice(0, 15).map((user, idx) => {
      return `**${idx + 1}. ${user.userName || user.username || user.name}**\n   📧 ${user.email}\n   🛡️ Role: ${user.role}\n   📁 Categories: ${user.allowed_categories?.join(", ") || "All"}`;
    }).join("\n\n") + (users.length > 15 ? `\n\n_...and ${users.length - 15} more_` : "");
  }

  // Format dashboard statistics
  private formatDashboardStats(dashboardData: any, contactCount: number): string {
    const stats = [
      `📊 **Dashboard Overview**\n`,
      `📇 **Total Contacts:** ${contactCount}`,
      `👥 **Total Users:** ${dashboardData?.totalUsers || 0}`,
    ];

    if (dashboardData?.recentActivities) {
      stats.push(`\n🎯 **Recent Activity:**\n${dashboardData.recentActivities.slice(0, 5).map((a: any) => `• ${a.action || a.type}`).join("\n")}`);
    }

    if (dashboardData?.weekActivities) {
      stats.push(`\n📅 **This Week:** ${dashboardData.weekActivities} activities`);
    }

    return stats.join("\n");
  }

  // Get category distribution from contacts data
  private getCategoryDistributionFromData(contacts: any[]): string {
    const categoryCount: Record<string, number> = {};
    
    contacts.forEach(contact => {
      if (contact.categories && Array.isArray(contact.categories)) {
        contact.categories.forEach((cat: string) => {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      }
    });

    if (Object.keys(categoryCount).length === 0) {
      return "No category data available";
    }

    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => `• **${category}**: ${count} contacts`)
      .join("\n");
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [{
      id: "system",
      role: "system",
      content: this.config.systemPrompt,
      timestamp: new Date(),
    }];
  }

  // Get conversation history
  getHistory(): ChatMessage[] {
    return this.conversationHistory.filter(msg => msg.role !== "system");
  }
}

// Singleton instance
export const assistantService = new AssistantService();


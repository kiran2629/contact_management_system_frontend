// AI Assistant Types - Enhanced for CRM
export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  actions?: ActionInstruction[];
  data?: any; // Optional data for context
}

export interface ActionInstruction {
  type: 
    | "navigate" 
    | "search_contacts"
    | "filter_category"
    | "create_contact" 
    | "update_contact"
    | "view_contact"
    | "show_stats"
    | "filter_role"
    | "export_data";
  label: string;
  params: Record<string, any>;
  icon?: string;
}

export interface AIResponse {
  message: string;
  actions?: ActionInstruction[];
  data?: any;
  confidence?: number;
}

export type AIProvider = "openai" | "anthropic" | "local";

export interface AssistantConfig {
  provider: AIProvider;
  apiKey?: string;
  endpoint?: string;
  model?: string;
  systemPrompt: string;
}

// Contact structure for AI context
export interface ContactContext {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  categories: string[];
  tags?: string[];
  status?: string;
  leadScore?: number;
}

// User structure for AI context
export interface UserContext {
  id: string;
  username: string;
  email: string;
  role: "Admin" | "HR" | "User";
  allowed_categories: string[];
  permissions?: any;
}


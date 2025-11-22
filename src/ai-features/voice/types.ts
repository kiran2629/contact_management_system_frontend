export type VoiceCommandType = "navigate" | "search" | "create" | "filter" | "action" | "ui";

export interface VoiceCommand {
  pattern: string | RegExp;
  type: VoiceCommandType;
  handler: (matches?: string[]) => void;
  description: string;
}

export interface VoiceState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}

export interface VoiceActionResult {
  success: boolean;
  message: string;
  action?: string;
}


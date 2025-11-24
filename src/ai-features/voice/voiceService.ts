import { voiceConfig } from "./voiceConfig";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private callbacks: {
    onResult?: (transcript: string, isFinal: boolean) => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {};

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition() {
    if (!this.isSupported()) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = voiceConfig.continuous;
    this.recognition.interimResults = voiceConfig.interimResults;
    this.recognition.lang = voiceConfig.language;
    this.recognition.maxAlternatives = voiceConfig.maxAlternatives;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.callbacks.onEnd) this.callbacks.onEnd();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript.trim();
      const isFinal = result.isFinal;

      if (this.callbacks.onResult) {
        this.callbacks.onResult(transcript, isFinal);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      if (this.callbacks.onError) {
        this.callbacks.onError(event.error);
      }
    };
  }

  isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start(callbacks: {
    onResult?: (transcript: string, isFinal: boolean) => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }) {
    if (!this.recognition || this.isListening) return;
    this.callbacks = callbacks;
    try {
      this.recognition.start();
    } catch (error) {
      if (callbacks.onError) callbacks.onError("Failed to start recognition");
    }
  }

  stop() {
    if (!this.recognition || !this.isListening) return;
    try {
      this.recognition.stop();
    } catch (error) {
      console.error("Error stopping recognition:", error);
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceService = new VoiceService();


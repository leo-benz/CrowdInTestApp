export interface CrowdinContext {
  project?: { id: number; name: string };
  user?: { id: number };
  [key: string]: unknown;
}

export interface TextareaEditedEvent {
  stringId: number;
  sourceText: string;
  context: string;
  oldTranslation: string;
  newTranslation: string;
  newText: string;
  id: number;
  [key: string]: unknown;
}

declare global {
  interface Window {
    AP?: {
      getContext: (callback: (context: CrowdinContext) => void) => void;
      getJwtToken: (callback: (token: string) => void) => void;
      events?: {
        on: (eventName: string, callback: (data: TextareaEditedEvent) => void) => void;
        off: (eventName: string, callback: (data: TextareaEditedEvent) => void) => void;
      };
    };
  }
}

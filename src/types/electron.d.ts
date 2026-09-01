import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  interface CSSProperties {
    WebkitAppRegion?: "drag" | "no-drag";
  }

  namespace JSX {
    interface IntrinsicElements {
      "emoji-picker": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "gif-picker": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

declare global {
  interface SavedTheme {
    name: string;
    createdAt: string;
    file: string;
    css?: string;
  }

  interface CachedLoginData {
    session?: {
      access_token: string;
      refresh_token: string;
    } | null;
  }

  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: string, data?: unknown): void;
        receive(channel: string, callback: (...args: unknown[]) => void): void;
        invoke(channel: string, data?: unknown): Promise<unknown> | undefined;
      };
    };
    electronAPI: {
      loadThemes(): Promise<SavedTheme[]>;
      saveTheme(name: string, css: string): Promise<{ success: boolean; path: string }>;
      getTheme(name: string): Promise<SavedTheme | null>;
      loginCache(data: CachedLoginData): Promise<boolean>;
      getLoginData(): Promise<CachedLoginData | null>;
      clearLoginData(): Promise<boolean>;
      loginDataLoaded(callback: (data: CachedLoginData) => void): void;
      onThemesChanged(callback: () => void): void;
    };
  }
}

export {};

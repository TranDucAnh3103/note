import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppSettings {
  appName: string;
  welcomeMessage: string;
  showWelcome: boolean;
  viewMode: "grid" | "compact";
  highlightColor: string;
  autoSave: boolean;
  autoSaveDelay: number;
  aiEnabled: boolean;
  language: "vi" | "en";
  pinnedActions: string[];
  shortcuts: Record<string, string>;
}

interface SettingsState {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  appName: "MemoStack",
  welcomeMessage: "Bắt đầu ghi lại suy nghĩ, kế hoạch và cảm hứng của bạn ngay hôm nay.",
  showWelcome: true,
  viewMode: "grid",
  highlightColor: "#fef08a",
  autoSave: true,
  autoSaveDelay: 30000,
  aiEnabled: true,
  language: "vi",
  pinnedActions: ["summarize", "edit"],
  shortcuts: {
    CREATE_NOTE: "Alt+N",
    SEARCH: "Alt+F",
    TOGGLE_SIDEBAR: "Alt+B",
    TOGGLE_THEME: "Alt+D",
    IMPORT: "Alt+I",
    GO_HOME: "Alt+H",
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: "notesys-settings",
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        settings: {
          ...currentState.settings,
          ...(persistedState?.settings || {}),
          shortcuts: {
            ...currentState.settings.shortcuts,
            ...(persistedState?.settings?.shortcuts || {}),
          },
        },
      }),
    },
  ),
);

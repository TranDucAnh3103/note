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
}

interface SettingsState {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  appName: "NoteSYS",
  welcomeMessage: "Chào mừng bạn đến với ứng dụng ghi chú!",
  showWelcome: true,
  viewMode: "grid",
  highlightColor: "#fef08a",
  autoSave: true,
  autoSaveDelay: 2000,
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
    },
  ),
);

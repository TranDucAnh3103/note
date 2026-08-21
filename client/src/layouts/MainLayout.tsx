import { ReactNode } from "react";
import { Sidebar, Header } from "@/components/layout";
import { NoteModal, ImportNoteModal } from "@/components/notes";
import { FolderModal } from "@/components/folders";
import { FloatingChat } from "@/components/ui";
import { useCopyProtection, useKeyboardShortcuts } from "@/hooks";
import { useSettingsStore } from "@/store/settingsStore";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  // Chặn copy ngoài vùng note-content
  useCopyProtection();

  // Keyboard shortcuts
  useKeyboardShortcuts();

  const { settings } = useSettingsStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Modals */}
      <NoteModal />
      <ImportNoteModal />
      <FolderModal />
      {settings.aiEnabled && <FloatingChat />}
    </div>
  );
}

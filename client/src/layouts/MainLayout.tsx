import { ReactNode } from "react";
import { Sidebar, Header } from "@/components/layout";
import { NoteModal } from "@/components/notes";
import { FolderModal } from "@/components/folders";
import { useCopyProtection, useKeyboardShortcuts } from "@/hooks";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  // Chặn copy ngoài vùng note-content
  useCopyProtection();

  // Keyboard shortcuts
  useKeyboardShortcuts();

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
      <FolderModal />
    </div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { Note } from "@/types";
import NoteCard from "./NoteCard";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";

interface NoteGridProps {
  notes: Note[];
  isLoading?: boolean;
  emptyMessage?: string;
  onMoveToFolder?: (noteId: string) => void;
  viewMode?: "grid" | "compact";
  searchQuery?: string;
}

export default function NoteGrid({
  notes,
  isLoading,
  emptyMessage = "No notes found",
  onMoveToFolder,
  viewMode = "grid",
  searchQuery,
}: NoteGridProps) {
  const gridClass =
    viewMode === "compact"
      ? "flex flex-col gap-2"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg bg-muted animate-pulse",
              viewMode === "compact" ? "h-16" : "h-48",
            )}
          />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description="Tạo ghi chú mới để bắt đầu."
      />
    );
  }

  // Separate pinned and unpinned notes
  const pinnedNotes = notes.filter((n) => n.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);

  return (
    <div className="space-y-8">
      {/* Pinned notes */}
      {pinnedNotes.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center">
            <span className="uppercase tracking-wider">Đã ghim</span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              {pinnedNotes.length}
            </span>
          </h2>
          <motion.div className={gridClass} layout>
            <AnimatePresence mode="popLayout">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onMoveToFolder={onMoveToFolder}
                  viewMode={viewMode}
                  searchQuery={searchQuery}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      )}

      {/* Other notes */}
      {unpinnedNotes.length > 0 && (
        <section>
          {pinnedNotes.length > 0 && (
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              Khác
            </h2>
          )}
          <motion.div className={gridClass} layout>
            <AnimatePresence mode="popLayout">
              {unpinnedNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onMoveToFolder={onMoveToFolder}
                  viewMode={viewMode}
                  searchQuery={searchQuery}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      )}
    </div>
  );
}

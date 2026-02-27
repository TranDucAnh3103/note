import { motion } from "framer-motion";
import { Archive } from "lucide-react";
import { useNotes } from "@/hooks";
import { useSearchStore } from "@/store";
import { NoteGrid } from "@/components/notes";

export default function ArchivedPage() {
  const { searchQuery, selectedSort } = useSearchStore();

  const { data: notesData, isLoading } = useNotes({
    isArchived: true,
    search: searchQuery || undefined,
    sort: selectedSort.value,
    order: selectedSort.order,
    limit: 50,
  });

  const notes = notesData?.notes || [];
  const total = notesData?.pagination.total || 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2 rounded-lg bg-amber-500/20">
          <Archive className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Archived Notes</h1>
          <p className="text-muted-foreground text-sm">
            {total} archived {total === 1 ? "note" : "notes"}
          </p>
        </div>
      </motion.div>

      {/* Notes grid */}
      <NoteGrid
        notes={notes}
        isLoading={isLoading}
        emptyMessage="No archived notes"
      />
    </div>
  );
}

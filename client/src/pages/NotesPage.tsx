import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  FolderOpen,
  Tag as TagIcon,
  LucideIcon,
  LayoutGrid,
  List,
} from "lucide-react";
import { useNotes, useFolder } from "@/hooks";
import { useSearchStore } from "@/store";
import { useSettingsStore } from "@/store/settingsStore";
import { NoteGrid } from "@/components/notes";
import { Button } from "@/components/ui";

export default function NotesPage() {
  const { folderId, tag } = useParams();
  const { searchQuery, selectedSort } = useSearchStore();
  const { data: folder } = useFolder(folderId || "");
  const { settings, updateSettings } = useSettingsStore();

  const { data: notesData, isLoading } = useNotes({
    folderId,
    tag,
    search: searchQuery || undefined,
    sort: selectedSort.value,
    order: selectedSort.order,
    limit: 50,
  });

  const notes = notesData?.notes || [];
  const total = notesData?.pagination.total || 0;

  // Determine page title
  let pageTitle = "All Notes";
  let PageIcon: LucideIcon = FileText;
  let pageColor = "#6366f1";

  if (folder) {
    pageTitle = folder.name;
    PageIcon = FolderOpen;
    pageColor = folder.color;
  } else if (tag) {
    pageTitle = `#${tag}`;
    PageIcon = TagIcon;
  } else if (searchQuery) {
    pageTitle = `Search: "${searchQuery}"`;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${pageColor}20` }}
          >
            <PageIcon className="h-6 w-6" style={{ color: pageColor }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
            <p className="text-muted-foreground text-sm">
              {total} {total === 1 ? "ghi chú" : "ghi chú"}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant={settings.viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => updateSettings({ viewMode: "grid" })}
            title="Dạng lưới"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={settings.viewMode === "compact" ? "default" : "ghost"}
            size="icon"
            onClick={() => updateSettings({ viewMode: "compact" })}
            title="Dạng danh sách"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Notes grid */}
      <NoteGrid
        notes={notes}
        isLoading={isLoading}
        viewMode={settings.viewMode}
        searchQuery={searchQuery}
        emptyMessage={
          searchQuery
            ? `No notes matching "${searchQuery}"`
            : folder
              ? `No notes in "${folder.name}"`
              : tag
                ? `No notes with tag #${tag}`
                : "No notes yet"
        }
      />
    </div>
  );
}

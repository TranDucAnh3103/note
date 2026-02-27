import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Pin,
  Archive,
  MoreVertical,
  Trash2,
  Edit,
  FolderInput,
  Copy,
  Download,
  FileText,
} from "lucide-react";
import { Note } from "@/types";
import { formatSmartDate, truncate } from "@/utils";
import { cn } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import {
  useTogglePin,
  useToggleArchive,
  useDeleteNote,
  useCreateNote,
} from "@/hooks";
import { useNoteModalStore } from "@/store";
import { useSettingsStore } from "@/store/settingsStore";
import toast from "react-hot-toast";

// Highlight text helper
const highlightText = (text: string, query?: string, color = "#fef08a") => {
  if (!query || !text) return text;
  const parts = text.split(
    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
  );
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        style={{
          backgroundColor: color,
          padding: "0 2px",
          borderRadius: "2px",
        }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
};

interface NoteCardProps {
  note: Note;
  onMoveToFolder?: (noteId: string) => void;
  viewMode?: "grid" | "compact";
  searchQuery?: string;
}

const NoteCard = memo(function NoteCard({
  note,
  onMoveToFolder,
  viewMode = "grid",
  searchQuery,
}: NoteCardProps) {
  const location = useLocation();
  const { openEditModal } = useNoteModalStore();
  const { settings } = useSettingsStore();
  const togglePin = useTogglePin();
  const toggleArchive = useToggleArchive();
  const deleteNote = useDeleteNote();
  const createNote = useCreateNote();

  // Duplicate note
  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await createNote.mutateAsync({
        title: `${note.title} (Bản sao)`,
        content: note.content,
        folderId:
          typeof note.folderId === "object"
            ? note.folderId?._id
            : note.folderId,
        tags: note.tags,
        color: note.color || undefined,
      });
      toast.success("Đã nhân bản ghi chú");
    } catch {
      toast.error("Không thể nhân bản ghi chú");
    }
  };

  // Copy to clipboard
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(note.content || "");
      toast.success("Đã sao chép nội dung");
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  // Export as TXT
  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const content = `${note.title}\n${"-".repeat(note.title.length)}\n\n${note.content || ""}\n\n---\nThẻ: ${note.tags.join(", ") || "Không có"}\nCập nhật: ${new Date(note.updatedAt).toLocaleString("vi-VN")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title.replace(/[^a-zA-Z0-9\u00C0-\u1EF9\s]/g, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Đã tải xuống file TXT");
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    togglePin.mutate(note._id);
  };

  const handleToggleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleArchive.mutate(note._id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) {
      deleteNote.mutate(note._id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openEditModal(note);
  };

  const cardStyle = note.color ? { backgroundColor: note.color } : {};
  const isActive = location.pathname === `/notes/${note._id}`;

  // Compact view
  if (viewMode === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.15 }}
      >
        <Link to={`/notes/${note._id}`}>
          <div
            className={cn(
              "group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all hover:shadow-sm",
              isActive && "ring-2 ring-primary",
              note.color && "border-transparent",
            )}
            style={cardStyle}
          >
            {/* Pin indicator */}
            {note.isPinned && (
              <Pin className="h-4 w-4 text-primary fill-current shrink-0" />
            )}

            {/* Title */}
            <h3
              className={cn(
                "font-medium text-sm flex-1 truncate",
                note.color ? "text-gray-900" : "text-card-foreground",
              )}
            >
              {highlightText(note.title, searchQuery, settings.highlightColor)}
            </h3>

            {/* Tags (max 2) */}
            <div className="hidden sm:flex gap-1 shrink-0">
              {note.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Date */}
            <span
              className={cn(
                "text-xs shrink-0",
                note.color ? "text-gray-500" : "text-muted-foreground",
              )}
            >
              {formatSmartDate(note.updatedAt)}
            </span>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTogglePin}>
                  <Pin className="h-4 w-4 mr-2" />
                  {note.isPinned ? "Bỏ ghim" : "Ghim"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  {note.isArchived ? "Bỏ lưu trữ" : "Lưu trữ"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/notes/${note._id}`}>
        <div
          className={cn(
            "group relative rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md",
            isActive && "ring-2 ring-primary",
            note.color && "border-transparent",
          )}
          style={cardStyle}
        >
          {/* Pin indicator */}
          {note.isPinned && (
            <div className="absolute -top-2 -right-2">
              <div className="rounded-full bg-primary p-1.5 shadow-sm">
                <Pin className="h-3 w-3 text-primary-foreground fill-current" />
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h3
              className={cn(
                "font-semibold text-base line-clamp-2 flex-1 mr-2",
                note.color ? "text-gray-900" : "text-card-foreground",
              )}
            >
              {highlightText(note.title, searchQuery, settings.highlightColor)}
            </h3>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTogglePin}>
                  <Pin className="h-4 w-4 mr-2" />
                  {note.isPinned ? "Bỏ ghim" : "Ghim"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  {note.isArchived ? "Bỏ lưu trữ" : "Lưu trữ"}
                </DropdownMenuItem>
                {onMoveToFolder && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onMoveToFolder(note._id);
                    }}
                  >
                    <FolderInput className="h-4 w-4 mr-2" />
                    Di chuyển
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDuplicate}>
                  <FileText className="h-4 w-4 mr-2" />
                  Nhân bản
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Sao chép
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Tải TXT
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content preview */}
          <p
            className={cn(
              "text-sm mb-3 line-clamp-3",
              note.color ? "text-gray-700" : "text-muted-foreground",
            )}
          >
            {highlightText(
              truncate(note.content || "Không có nội dung", 150),
              searchQuery,
              settings.highlightColor,
            )}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Date */}
            <span
              className={cn(
                "text-xs",
                note.color ? "text-gray-500" : "text-muted-foreground",
              )}
            >
              {formatSmartDate(note.updatedAt)}
            </span>
          </div>

          {/* Folder badge */}
          {note.folderId && typeof note.folderId === "object" && (
            <div className="mt-2 pt-2 border-t border-current/10">
              <span
                className="inline-flex items-center text-xs"
                style={{ color: note.folderId.color }}
              >
                <span
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: note.folderId.color }}
                />
                {note.folderId.name}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
});

export default NoteCard;

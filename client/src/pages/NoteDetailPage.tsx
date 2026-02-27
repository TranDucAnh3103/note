import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pin,
  Archive,
  Trash2,
  Edit,
  FolderOpen,
  Tag,
  Clock,
  Calendar,
} from "lucide-react";
import {
  useNote,
  useTogglePin,
  useToggleArchive,
  useDeleteNote,
} from "@/hooks";
import { useNoteModalStore } from "@/store";
import { Button, Badge, LoadingScreen } from "@/components/ui";
import { formatSmartDate } from "@/utils";
import { cn } from "@/lib/utils";

export default function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: note, isLoading, error } = useNote(id || "");
  const { openEditModal } = useNoteModalStore();
  const togglePin = useTogglePin();
  const toggleArchive = useToggleArchive();
  const deleteNote = useDeleteNote();

  if (isLoading) {
    return <LoadingScreen text="Loading note..." />;
  }

  if (error || !note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-xl font-semibold mb-2">Note not found</h2>
        <p className="text-muted-foreground mb-4">
          This note may have been deleted or doesn't exist.
        </p>
        <Button onClick={() => navigate("/notes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notes
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote.mutate(note._id, {
        onSuccess: () => navigate("/notes"),
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              {note.isPinned && (
                <div className="p-1.5 rounded-full bg-primary mt-1">
                  <Pin className="h-4 w-4 text-primary-foreground fill-current" />
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-bold">{note.title}</h1>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Created {formatSmartDate(note.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Updated {formatSmartDate(note.updatedAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditModal(note)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => togglePin.mutate(note._id)}
              className={cn(
                "gap-2",
                note.isPinned && "bg-primary/10 border-primary",
              )}
            >
              <Pin className={cn("h-4 w-4", note.isPinned && "fill-current")} />
              {note.isPinned ? "Unpin" : "Pin"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleArchive.mutate(note._id)}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              {note.isArchived ? "Unarchive" : "Archive"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tags & Folder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-6"
      >
        {note.folderId && typeof note.folderId === "object" && (
          <Badge
            variant="outline"
            className="gap-1.5 py-1"
            style={{
              borderColor: note.folderId.color,
              color: note.folderId.color,
            }}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            {note.folderId.name}
          </Badge>
        )}
        {note.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            <Tag className="h-3 w-3" />
            {tag}
          </Badge>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "bg-card rounded-xl border p-6 md:p-8 shadow-sm min-h-[300px]",
          note.color && "border-transparent",
        )}
        style={note.color ? { backgroundColor: note.color } : {}}
      >
        {note.content ? (
          <div
            className={cn(
              "prose prose-sm md:prose-base max-w-none",
              "dark:prose-invert",
              note.color && "prose-gray",
            )}
          >
            <pre className="whitespace-pre-wrap font-sans text-foreground bg-transparent p-0 overflow-visible">
              {note.content}
            </pre>
          </div>
        ) : (
          <p className="text-muted-foreground italic">No content</p>
        )}
      </motion.div>
    </div>
  );
}

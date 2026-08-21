import { useState } from "react";
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
  Sparkles,
  Download,
  MoreHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useNote,
  useTogglePin,
  useToggleArchive,
  useDeleteNote,
} from "@/hooks";
import { useNoteModalStore, useSettingsStore } from "@/store";
import { Button, Badge, LoadingScreen } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { formatSmartDate, linkifyText, exportAsTxt, exportAsMd } from "@/utils";
import { cn } from "@/lib/utils";

export default function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: note, isLoading, error } = useNote(id || "");
  const { openEditModal } = useNoteModalStore();
  const { settings } = useSettingsStore();
  const togglePin = useTogglePin();
  const toggleArchive = useToggleArchive();
  const deleteNote = useDeleteNote();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

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

  const handleSummarize = async () => {
    try {
      setIsSummarizing(true);
      const { aiApi } = await import("@/api/ai");
      const res: any = await aiApi.summarizeNote(note._id);
      if (res.success) {
        toast.success("AI Summarize success!");
        // We can just rely on standard React Query invalidation or simple reload
        // Since useQueryClient isn't directly exposed at the top, reload is easiest for this demo
        window.location.reload(); 
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to summarize");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteNote.mutate(note._id, {
      onSuccess: () => navigate("/notes"),
    });
    setShowDeleteDialog(false);
  };

  // Removed updateSettings destructuring as it is accessed directly on the state
  const pinnedActions = settings.pinnedActions || ["summarize", "edit"];

  const handleTogglePinAction = (actionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let currentPinned = [...pinnedActions];
    
    if (currentPinned.includes(actionId)) {
      currentPinned = currentPinned.filter(id => id !== actionId);
    } else {
      if (currentPinned.length >= 2) {
        toast.error("Chỉ được ghim tối đa 2 nút thao tác");
        return;
      }
      currentPinned.push(actionId);
    }
    useSettingsStore.getState().updateSettings({ pinnedActions: currentPinned });
    toast.success("Đã cập nhật ghim nút");
  };

  const allActions = [
    {
      id: "summarize",
      label: isSummarizing ? "Summarizing..." : "AI Summarize",
      icon: Sparkles,
      onClick: handleSummarize,
      disabled: isSummarizing || note.isAiProcessed,
      hidden: !settings.aiEnabled,
      className: "border-purple-500 text-purple-600 hover:bg-purple-50",
      iconClassName: ""
    },
    {
      id: "edit",
      label: "Edit",
      icon: Edit,
      onClick: () => openEditModal(note),
      disabled: false,
      hidden: false,
      className: "",
      iconClassName: ""
    },
    {
      id: "pin",
      label: note.isPinned ? "Unpin" : "Pin",
      icon: Pin,
      onClick: () => togglePin.mutate(note._id),
      disabled: false,
      hidden: false,
      className: note.isPinned ? "bg-primary/10 border-primary" : "",
      iconClassName: note.isPinned ? "fill-current" : ""
    },
    {
      id: "archive",
      label: note.isArchived ? "Unarchive" : "Archive",
      icon: Archive,
      onClick: () => toggleArchive.mutate(note._id),
      disabled: false,
      hidden: false,
      className: "",
      iconClassName: ""
    },
    {
      id: "txt",
      label: "Tải TXT",
      icon: Download,
      onClick: () => exportAsTxt(note),
      disabled: false,
      hidden: false,
      className: "",
      iconClassName: ""
    },
    {
      id: "md",
      label: "Tải Markdown",
      icon: Download,
      onClick: () => exportAsMd(note),
      disabled: false,
      hidden: false,
      className: "",
      iconClassName: ""
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      onClick: handleDelete,
      disabled: false,
      hidden: false,
      className: "text-destructive hover:bg-destructive hover:text-destructive-foreground",
      iconClassName: ""
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa ghi chú?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa "{note.title}"? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
          <div className="flex flex-wrap items-center gap-2">
            {allActions
              .filter(a => (settings.pinnedActions || ["summarize", "edit"]).includes(a.id) && !a.hidden)
              .map(a => (
                <Button
                  key={a.id}
                  variant="outline"
                  size="sm"
                  onClick={a.onClick}
                  onContextMenu={(e) => handleTogglePinAction(a.id, e)}
                  disabled={a.disabled}
                  className={cn("gap-2", a.className)}
                  title="Chuột phải / Ấn đè để bỏ ghim"
                >
                  <a.icon className={cn("h-4 w-4", a.iconClassName)} />
                  {a.label}
                </Button>
              ))}

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2" title="Thêm thao tác">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {allActions
                  .filter(a => !(settings.pinnedActions || ["summarize", "edit"]).includes(a.id) && !a.hidden)
                  .map((a, i) => (
                    <div key={a.id}>
                      {i === 2 || i === 4 ? <DropdownMenuSeparator /> : null}
                      <DropdownMenuItem
                        onClick={a.onClick}
                        onContextMenu={(e) => handleTogglePinAction(a.id, e)}
                        disabled={a.disabled}
                        className={cn(a.id === 'delete' && "text-destructive focus:text-destructive focus:bg-destructive/10")}
                        title="Chuột phải / Ấn đè để ghim ra ngoài"
                      >
                        <a.icon className={cn("h-4 w-4 mr-2", a.iconClassName)} />
                        {a.label}
                      </DropdownMenuItem>
                    </div>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
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

      {/* Summary (if exists) */}
      {note.summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg mb-6"
        >
          <div className="flex items-center gap-2 mb-2 font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            AI Summary
          </div>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{note.summary}</p>
        </motion.div>
      )}

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
              {linkifyText(note.content)}
            </pre>
          </div>
        ) : (
          <p className="text-muted-foreground italic">No content</p>
        )}
      </motion.div>
    </div>
  );
}

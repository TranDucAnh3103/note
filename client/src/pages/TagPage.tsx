import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tag, Trash2, Edit, AlertTriangle } from "lucide-react";
import { useNotes, useTags, useDeleteTag, useRenameTag } from "@/hooks";
import { useSearchStore } from "@/store";
import { NoteGrid } from "@/components/notes";
import { Button, Input } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const { searchQuery, selectedSort } = useSearchStore();
  const { data: allTags } = useTags();
  const deleteTag = useDeleteTag();
  const renameTag = useRenameTag();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newTagName, setNewTagName] = useState(tag || "");

  const { data: notesData, isLoading } = useNotes({
    tag,
    search: searchQuery || undefined,
    sort: selectedSort.value,
    order: selectedSort.order,
    limit: 100,
  });

  const notes = notesData?.notes || [];
  const total = notesData?.pagination.total || 0;

  const handleDeleteTag = async () => {
    if (!tag) return;
    try {
      await deleteTag.mutateAsync(tag);
      navigate("/notes");
    } catch {
      // Error handled by mutation
    }
  };

  const handleRenameTag = async () => {
    if (!tag || !newTagName.trim() || newTagName === tag) return;

    // Check if new tag name already exists
    if (allTags?.includes(newTagName.toLowerCase())) {
      // Will merge with existing tag
    }

    try {
      await renameTag.mutateAsync({ oldTag: tag, newTag: newTagName.trim() });
      setShowRenameDialog(false);
      navigate(`/tag/${encodeURIComponent(newTagName.trim().toLowerCase())}`);
    } catch {
      // Error handled by mutation
    }
  };

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
            style={{ backgroundColor: "#8b5cf620" }}
          >
            <Tag className="h-6 w-6" style={{ color: "#8b5cf6" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">#{tag}</h1>
            <p className="text-muted-foreground text-sm">
              {total} {total === 1 ? "ghi chú" : "ghi chú"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewTagName(tag || "");
              setShowRenameDialog(true);
            }}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Đổi tên</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Xóa thẻ</span>
          </Button>
        </div>
      </motion.div>

      {/* Notes grid */}
      <NoteGrid
        notes={notes}
        isLoading={isLoading}
        emptyMessage={`Không có ghi chú nào với thẻ #${tag}`}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Xóa thẻ #{tag}?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Thẻ này sẽ bị xóa khỏi tất cả {total} ghi chú. Hành động này không
            thể hoàn tác.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTag}
              disabled={deleteTag.isPending}
            >
              {deleteTag.isPending ? "Đang xóa..." : "Xóa thẻ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Đổi tên thẻ #{tag}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên thẻ mới</label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nhập tên thẻ mới"
                autoFocus
              />
              {allTags?.includes(newTagName.toLowerCase()) &&
                newTagName.toLowerCase() !== tag?.toLowerCase() && (
                  <p className="text-xs text-amber-500">
                    Thẻ này đã tồn tại. Các ghi chú sẽ được gộp vào thẻ hiện có.
                  </p>
                )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRenameDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleRenameTag}
              disabled={
                renameTag.isPending || !newTagName.trim() || newTagName === tag
              }
            >
              {renameTag.isPending ? "Đang lưu..." : "Đổi tên"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

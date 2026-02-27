import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Hash, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button, Input, Textarea, Badge } from "@/components/ui";
import {
  useNoteModalStore,
  useFolders,
  useCreateNote,
  useUpdateNote,
  useTags,
} from "@/hooks";
import { NOTE_COLORS } from "@/constants";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().max(100000).optional(),
  folderId: z.string().nullable().optional(),
  tags: z.array(z.string()).max(10).optional(),
  color: z.string().nullable().optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

export default function NoteModal() {
  const { isOpen, mode, note, folderId, closeModal } = useNoteModalStore();
  const { data: folders } = useFolders();
  const { data: existingTags } = useTags();
  const { settings } = useSettingsStore();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
      folderId: null,
      tags: [],
      color: null,
    },
  });

  const watchedTags = watch("tags") || [];
  const watchedColor = watch("color");
  const watchedContent = watch("content") || "";
  const watchedTitle = watch("title") || "";
  const watchedFolderId = watch("folderId");

  // Word and character count
  const contentStats = useMemo(() => {
    const chars = watchedContent.length;
    const words = watchedContent.trim()
      ? watchedContent.trim().split(/\s+/).length
      : 0;
    return { chars, words };
  }, [watchedContent]);

  // Auto-save for edit mode
  const performAutoSave = useCallback(async () => {
    if (mode !== "edit" || !note || !settings.autoSave) return;
    if (!watchedTitle.trim()) return;

    try {
      await updateNote.mutateAsync({
        id: note._id,
        data: {
          title: watchedTitle,
          content: watchedContent,
          folderId: watchedFolderId || null,
          tags: watchedTags,
          color: watchedColor || undefined,
        },
      });
    } catch {
      // Auto-save failed silently
    }
  }, [
    mode,
    note,
    settings.autoSave,
    watchedTitle,
    watchedContent,
    watchedFolderId,
    watchedTags,
    watchedColor,
    updateNote,
  ]);

  // Debounced auto-save
  useEffect(() => {
    if (mode !== "edit" || !note || !settings.autoSave || !isOpen) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(() => {
      performAutoSave();
    }, settings.autoSaveDelay);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    watchedTitle,
    watchedContent,
    watchedFolderId,
    watchedTags,
    watchedColor,
    mode,
    note,
    settings.autoSave,
    settings.autoSaveDelay,
    isOpen,
    performAutoSave,
  ]);

  // Tag suggestions based on input
  const tagSuggestions = useMemo(() => {
    if (!tagInput.trim() || !existingTags) return [];
    return existingTags
      .filter(
        (tag) =>
          tag.toLowerCase().includes(tagInput.toLowerCase()) &&
          !watchedTags.includes(tag),
      )
      .slice(0, 5);
  }, [tagInput, existingTags, watchedTags]);

  // Reset form when mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && note) {
        reset({
          title: note.title,
          content: note.content,
          folderId:
            typeof note.folderId === "object"
              ? note.folderId?._id
              : note.folderId,
          tags: note.tags,
          color: note.color,
        });
      } else {
        reset({
          title: "",
          content: "",
          folderId: folderId || null,
          tags: [],
          color: null,
        });
      }
    }
  }, [isOpen, mode, note, folderId, reset]);

  const onSubmit = async (data: NoteFormData) => {
    try {
      if (mode === "edit" && note) {
        await updateNote.mutateAsync({
          id: note._id,
          data: {
            ...data,
            folderId: data.folderId || null,
            color: data.color || undefined,
          },
        });
      } else {
        await createNote.mutateAsync({
          ...data,
          folderId: data.folderId || null,
          color: data.color || undefined,
        });
      }
      closeModal();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();

      if (tag && !watchedTags.includes(tag) && watchedTags.length < 10) {
        setValue("tags", [...watchedTags, tag]);
        setTagInput("");
        setShowTagSuggestions(false);
      }
    }
  };

  const handleSelectSuggestion = (tag: string) => {
    if (!watchedTags.includes(tag) && watchedTags.length < 10) {
      setValue("tags", [...watchedTags, tag]);
      setTagInput("");
      setShowTagSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Chỉnh sửa ghi chú" : "Tạo ghi chú mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <Input
              {...register("title")}
              placeholder="Tiêu đề ghi chú"
              className="text-lg font-semibold"
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Content - with dynamic color */}
          <div>
            <Textarea
              {...register("content")}
              placeholder="Viết nội dung ghi chú của bạn..."
              className="min-h-[200px] resize-y note-content transition-colors duration-200"
              style={{
                backgroundColor: watchedColor ? `${watchedColor}60` : undefined,
              }}
            />
            {/* Word count */}
            <div className="flex justify-end mt-1 text-xs text-muted-foreground">
              {contentStats.words} từ • {contentStats.chars} ký tự
            </div>
          </div>

          {/* Folder */}
          <div>
            <label className="text-sm font-medium mb-2 block">Thư mục</label>
            <select
              {...register("folderId")}
              className="w-full h-12 sm:h-10 rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm appearance-none"
            >
              <option value="">Không có thư mục</option>
              {folders?.map((folder) => (
                <option key={folder._id} value={folder._id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block">Thẻ (Tags)</label>
            <div className="space-y-2 relative">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập thẻ"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowTagSuggestions(true);
                  }}
                  onKeyDown={handleAddTag}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowTagSuggestions(false), 200)
                  }
                  disabled={watchedTags.length >= 10}
                  className="flex-1 h-12 sm:h-10 text-base sm:text-sm"
                />
                {/* Button cho mobile */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 sm:h-10 sm:w-10 flex-shrink-0"
                  onClick={() => {
                    const tag = tagInput.trim().toLowerCase();
                    if (
                      tag &&
                      !watchedTags.includes(tag) &&
                      watchedTags.length < 10
                    ) {
                      setValue("tags", [...watchedTags, tag]);
                      setTagInput("");
                      setShowTagSuggestions(false);
                    }
                  }}
                  disabled={!tagInput.trim() || watchedTags.length >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {/* Tag suggestions */}
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg">
                  {tagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                      onMouseDown={() => handleSelectSuggestion(tag)}
                    >
                      <Hash className="h-3 w-3" />
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              {watchedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      onRemove={() => handleRemoveTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-sm font-medium mb-2 block">Màu nền</label>
            <div className="flex flex-wrap gap-2">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setValue("color", color.value)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    watchedColor === color.value
                      ? "border-primary ring-2 ring-primary/20 scale-110"
                      : "border-muted hover:border-muted-foreground/50 hover:scale-105",
                  )}
                  style={{
                    backgroundColor: color.value || "transparent",
                  }}
                  title={color.name}
                >
                  {!color.value && (
                    <X className="w-4 h-4 mx-auto text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Đang lưu..."
                : mode === "edit"
                  ? "Cập nhật"
                  : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

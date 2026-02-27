import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button, Input } from "@/components/ui";
import { useFolderModalStore } from "@/store";
import { useCreateFolder, useUpdateFolder } from "@/hooks";
import { FOLDER_COLORS, FOLDER_ICONS } from "@/constants";
import { cn } from "@/lib/utils";
import {
  Folder as FolderIcon,
  Briefcase,
  User,
  Lightbulb,
  FolderKanban,
  GraduationCap,
  Star,
  Heart,
  Bookmark,
  Code,
  Music,
  Image,
  FileText,
  Calendar,
  Home,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: FolderIcon,
  briefcase: Briefcase,
  user: User,
  lightbulb: Lightbulb,
  "folder-kanban": FolderKanban,
  "graduation-cap": GraduationCap,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  code: Code,
  music: Music,
  image: Image,
  "file-text": FileText,
  calendar: Calendar,
  home: Home,
};

export default function FolderModal() {
  const {
    isOpen,
    mode,
    folderId,
    folderName,
    folderColor,
    folderIcon,
    closeModal,
  } = useFolderModalStore();
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [icon, setIcon] = useState("folder");

  useEffect(() => {
    if (isOpen) {
      setName(folderName);
      setColor(folderColor);
      setIcon(folderIcon);
    }
  }, [isOpen, folderName, folderColor, folderIcon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (mode === "edit" && folderId) {
        await updateFolder.mutateAsync({
          id: folderId,
          data: { name: name.trim(), color, icon },
        });
      } else {
        await createFolder.mutateAsync({ name: name.trim(), color, icon });
      }
      closeModal();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isSubmitting = createFolder.isPending || updateFolder.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent
        className="sm:max-w-[400px] transition-colors duration-300"
        style={{
          borderLeftColor: color,
          borderLeftWidth: 4,
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Chỉnh sửa thư mục" : "Tạo thư mục"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên thư mục"
              autoFocus
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Màu sắc</label>
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    color === c
                      ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                      : "hover:scale-110",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Biểu tượng</label>
            <div className="flex flex-wrap gap-2">
              {FOLDER_ICONS.map((iconKey) => {
                const IconComponent = iconMap[iconKey] || FolderIcon;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setIcon(iconKey)}
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                      icon === iconKey
                        ? "ring-2 ring-offset-2 ring-offset-background ring-primary bg-primary/10"
                        : "hover:bg-accent",
                    )}
                  >
                    <IconComponent className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
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

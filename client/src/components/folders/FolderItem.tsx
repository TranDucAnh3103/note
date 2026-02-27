import { memo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Folder as FolderIcon,
  MoreVertical,
  Edit,
  Trash2,
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
  Plus,
} from "lucide-react";
import { Folder } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { useFolderModalStore, useNoteModalStore } from "@/store";
import { useDeleteFolder } from "@/hooks";
import { useSidebarStore } from "@/store";

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
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

interface FolderItemProps {
  folder: Folder;
}

const FolderItem = memo(function FolderItem({ folder }: FolderItemProps) {
  const { folderId } = useParams();
  const { openEditModal } = useFolderModalStore();
  const { openCreateModal: openNoteModal } = useNoteModalStore();
  const { closeMobileSidebar } = useSidebarStore();
  const deleteFolder = useDeleteFolder();
  const isActive = folderId === folder._id;

  const Icon = iconMap[folder.icon] || FolderIcon;

  const handleAddNote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openNoteModal(folder._id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openEditModal(folder._id, folder.name, folder.color, folder.icon);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Xóa thư mục "${folder.name}"? Các ghi chú sẽ không bị xóa.`)) {
      deleteFolder.mutate(folder._id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
    >
      <Link
        to={`/folder/${folder._id}`}
        onClick={closeMobileSidebar}
        className={cn(
          "group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent text-foreground",
        )}
      >
        <div
          className="p-1.5 rounded-md"
          style={{
            backgroundColor: isActive
              ? "rgba(255,255,255,0.2)"
              : `${folder.color}20`,
          }}
        >
          <Icon
            className="h-4 w-4"
            style={{ color: isActive ? "currentColor" : folder.color }}
          />
        </div>

        <span className="flex-1 truncate text-sm font-medium">
          {folder.name}
        </span>

        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            isActive
              ? "bg-white/20 text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {folder.notesCount || 0}
        </span>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-6 w-6",
                isActive && "text-primary-foreground hover:bg-white/20",
              )}
              onClick={(e) => e.preventDefault()}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleAddNote}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm ghi chú
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
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
      </Link>
    </motion.div>
  );
});

export default FolderItem;

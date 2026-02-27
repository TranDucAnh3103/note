import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Folder } from "@/types";
import FolderItem from "./FolderItem";
import { Button } from "@/components/ui";
import { useFolderModalStore } from "@/store";

interface FolderListProps {
  folders: Folder[];
  isLoading?: boolean;
}

export default function FolderList({ folders, isLoading }: FolderListProps) {
  const { openCreateModal } = useFolderModalStore();

  if (isLoading) {
    return (
      <div className="space-y-2 px-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 px-2">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Thư mục
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={openCreateModal}
          className="h-6 w-6"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {folders.map((folder) => (
          <FolderItem key={folder._id} folder={folder} />
        ))}
      </AnimatePresence>

      {folders.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có thư mục nào
        </p>
      )}
    </div>
  );
}

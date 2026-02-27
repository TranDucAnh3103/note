import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { useNoteModalStore } from "@/store";
import { useIsMobile } from "@/hooks";

export default function FloatingActionButton() {
  const { openCreateModal } = useNoteModalStore();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => openCreateModal()}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </motion.div>
  );
}

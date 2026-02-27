import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  FolderOpen,
  Tag,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useNotes, useFolders, useTags } from "@/hooks";
import { useNoteModalStore } from "@/store";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@/components/ui";
import { NoteCard } from "@/components/notes";

export default function HomePage() {
  const { data: notesData, isLoading: notesLoading } = useNotes({ limit: 4 });
  const { data: folders } = useFolders();
  const { data: tags } = useTags();
  const { openCreateModal } = useNoteModalStore();
  const { settings } = useSettingsStore();

  const recentNotes = notesData?.notes || [];
  const totalNotes = notesData?.pagination.total || 0;

  const stats = [
    {
      label: "Total Notes",
      value: totalNotes,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      label: "Folders",
      value: folders?.length || 0,
      icon: FolderOpen,
      color: "bg-green-500",
    },
    {
      label: "Tags",
      value: tags?.length || 0,
      icon: Tag,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      {settings.showWelcome && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 md:p-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {settings.appName} 👋
          </h1>
          <p className="text-muted-foreground mb-4 max-w-xl">
            {settings.welcomeMessage}
          </p>
          <Button onClick={() => openCreateModal()} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo ghi chú mới
          </Button>
        </motion.section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-4 border shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Recent notes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Notes
          </h2>
          <Link to="/notes">
            <Button variant="ghost" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {notesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : recentNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentNotes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first note to get started
            </p>
            <Button onClick={() => openCreateModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>
        )}
      </section>

      {/* Quick access folders */}
      {folders && folders.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Your Folders
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {folders.slice(0, 5).map((folder) => (
              <Link key={folder._id} to={`/folder/${folder._id}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-card rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${folder.color}20` }}
                  >
                    <FolderOpen
                      className="h-5 w-5"
                      style={{ color: folder.color }}
                    />
                  </div>
                  <h3 className="font-medium truncate">{folder.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {folder.notesCount || 0} notes
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

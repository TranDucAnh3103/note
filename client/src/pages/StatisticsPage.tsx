import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  FolderOpen,
  Tag,
  Pin,
  Archive,
  Calendar,
} from "lucide-react";
import { useNotes, useFolders, useTags } from "@/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export default function StatisticsPage() {
  // Fetch active notes (not archived)
  const { data: activeNotesData } = useNotes({ limit: 1000 });
  // Fetch archived notes separately
  const { data: archivedNotesData } = useNotes({
    limit: 1000,
    isArchived: true,
  });
  // Fetch pinned notes count
  const { data: pinnedNotesData } = useNotes({
    limit: 1,
    isPinned: true,
  });
  const { data: folders } = useFolders();
  const { data: tags } = useTags();

  const activeNotes = activeNotesData?.notes || [];
  const archivedNotesList = archivedNotesData?.notes || [];

  // Use pagination.total for accurate counts
  const totalActiveNotes = activeNotesData?.pagination?.total || 0;
  const totalArchivedNotes = archivedNotesData?.pagination?.total || 0;
  const totalPinnedNotes = pinnedNotesData?.pagination?.total || 0;

  // Combine both for chart calculations
  const allNotes = [...activeNotes, ...archivedNotesList];

  const totalNotes = totalActiveNotes + totalArchivedNotes;
  const pinnedNotes = totalPinnedNotes;
  const archivedNotes = totalArchivedNotes;
  const totalFolders = folders?.length || 0;
  const totalTags = tags?.length || 0;

  // Calculate notes per folder
  const notesPerFolder =
    folders?.map((folder) => ({
      name: folder.name,
      count: folder.notesCount || 0,
      color: folder.color,
    })) || [];

  // Calculate notes by month (last 6 months) - using all notes
  const notesByMonth: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString("vi-VN", {
      month: "short",
      year: "numeric",
    });
    notesByMonth[monthKey] = 0;
  }

  allNotes.forEach((note) => {
    const noteDate = new Date(note.createdAt);
    const monthKey = noteDate.toLocaleDateString("vi-VN", {
      month: "short",
      year: "numeric",
    });
    if (notesByMonth[monthKey] !== undefined) {
      notesByMonth[monthKey]++;
    }
  });

  const stats = [
    {
      label: "Tổng ghi chú",
      value: totalNotes,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      label: "Đã ghim",
      value: pinnedNotes,
      icon: Pin,
      color: "bg-yellow-500",
    },
    {
      label: "Lưu trữ",
      value: archivedNotes,
      icon: Archive,
      color: "bg-gray-500",
    },
    {
      label: "Thư mục",
      value: totalFolders,
      icon: FolderOpen,
      color: "bg-green-500",
    },
    {
      label: "Thẻ",
      value: totalTags,
      icon: Tag,
      color: "bg-purple-500",
    },
  ];

  const maxNoteCount = Math.max(...Object.values(notesByMonth), 1);
  const maxFolderCount = Math.max(...notesPerFolder.map((f) => f.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 max-w-6xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Thống kê</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Ghi chú theo tháng
            </CardTitle>
            <CardDescription>6 tháng gần đây</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(notesByMonth).map(([month, count]) => (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-sm w-24 text-muted-foreground">
                    {month}
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxNoteCount) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes per Folder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Ghi chú theo thư mục
            </CardTitle>
            <CardDescription>Top thư mục có nhiều ghi chú</CardDescription>
          </CardHeader>
          <CardContent>
            {notesPerFolder.length > 0 ? (
              <div className="space-y-3">
                {notesPerFolder
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 8)
                  .map((folder) => (
                    <div key={folder.name} className="flex items-center gap-3">
                      <span
                        className="text-sm w-24 truncate"
                        title={folder.name}
                      >
                        {folder.name}
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(folder.count / maxFolderCount) * 100}%`,
                          }}
                          transition={{ duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: folder.color }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {folder.count}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Chưa có thư mục nào
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

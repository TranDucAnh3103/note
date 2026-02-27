import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Archive,
  Tag,
  X,
  Settings,
  BarChart3,
} from "lucide-react";
import { useFolders, useTags, useIsMobile } from "@/hooks";
import { useSidebarStore } from "@/store";
import { useSettingsStore } from "@/store/settingsStore";
import { FolderList } from "@/components/folders";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const location = useLocation();
  const { isOpen, isMobileOpen, closeMobileSidebar } = useSidebarStore();
  const { settings } = useSettingsStore();
  const { data: folders, isLoading: foldersLoading } = useFolders();
  const { data: tags } = useTags();
  const isMobile = useIsMobile();

  const navItems = [
    { path: "/", label: "Trang chủ", icon: Home },
    { path: "/notes", label: "Tất cả ghi chú", icon: FileText },
    { path: "/archived", label: "Lưu trữ", icon: Archive },
    { path: "/statistics", label: "Thống kê", icon: BarChart3 },
    { path: "/settings", label: "Cài đặt", icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">{settings.appName}</span>
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={closeMobileSidebar}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Main nav */}
        <div className="space-y-1 px-2 mb-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Folders */}
        <div className="mb-6">
          <FolderList folders={folders || []} isLoading={foldersLoading} />
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="px-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Thẻ
              </span>
            </div>
            <div className="flex flex-wrap gap-2 px-3">
              {tags.slice(0, 10).map((tag) => (
                <Link
                  key={tag}
                  to={`/tag/${tag}`}
                  onClick={closeMobileSidebar}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                    location.pathname === `/tag/${tag}`
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  )}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );

  // Desktop sidebar
  if (!isMobile) {
    return (
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 280 : 0 }}
        className="h-screen border-r bg-card overflow-hidden flex-shrink-0"
      >
        <div className="w-[280px] h-full">{sidebarContent}</div>
      </motion.aside>
    );
  }

  // Mobile sidebar (drawer)
  return (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSidebar}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-[280px] bg-card z-50 md:hidden shadow-xl"
          >
            {sidebarContent}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

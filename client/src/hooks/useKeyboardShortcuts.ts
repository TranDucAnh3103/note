import { useEffect, useCallback } from "react";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import { useNoteModalStore, useSidebarStore, useThemeStore, useImportModalStore, useSettingsStore } from "@/store";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

/**
 * Hook để xử lý keyboard shortcuts toàn cục
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openCreateModal } = useNoteModalStore();
  const { openModal: openImportModal } = useImportModalStore();
  const { toggleSidebar } = useSidebarStore();
  const { toggleTheme } = useThemeStore();

  const focusSearch = useCallback(() => {
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[placeholder*="Tìm kiếm"], input[placeholder*="Search"]',
    );
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  const match = matchPath("/folder/:folderId", location.pathname);
  const { settings } = useSettingsStore();

  const parseShortcutStr = (str: string, action: () => void, description: string): KeyboardShortcut => {
    const parts = str.toLowerCase().split("+");
    return {
      key: parts[parts.length - 1],
      ctrl: parts.includes("ctrl"),
      shift: parts.includes("shift"),
      alt: parts.includes("alt"),
      action,
      description,
    };
  };

  const currentFolderId = match?.params?.folderId || null;

  const shortcuts: KeyboardShortcut[] = [
    parseShortcutStr(settings.shortcuts?.CREATE_NOTE || "Alt+N", () => openCreateModal(currentFolderId), "Tạo ghi chú mới"),
    parseShortcutStr(settings.shortcuts?.SEARCH || "Alt+F", focusSearch, "Tìm kiếm"),
    parseShortcutStr(settings.shortcuts?.TOGGLE_SIDEBAR || "Alt+B", toggleSidebar, "Mở/đóng sidebar"),
    parseShortcutStr(settings.shortcuts?.TOGGLE_THEME || "Alt+D", toggleTheme, "Chuyển đổi chế độ sáng/tối"),
    parseShortcutStr(settings.shortcuts?.IMPORT || "Alt+I", () => openImportModal(currentFolderId), "Nhập file"),
    parseShortcutStr(settings.shortcuts?.GO_HOME || "Alt+H", () => navigate("/"), "Về trang chủ"),
    {
      key: "/",
      action: focusSearch,
      description: "Tìm kiếm (phím tắt /)",
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang focus vào input/textarea
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Cho phép một số shortcuts ngay cả khi đang trong input
      const allowInInput = ["Escape"];

      if (isInputFocused && !allowInInput.includes(e.key)) {
        // Chỉ xử lý Ctrl+S trong input để save
        if (e.ctrlKey && e.key === "s") {
          e.preventDefault();
          // Trigger form submit nếu có
          const form = target.closest("form");
          if (form) {
            form.requestSubmit();
          }
        }
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts]);

  return shortcuts;
};

export default useKeyboardShortcuts;

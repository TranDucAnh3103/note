import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useNoteModalStore } from "@/store";

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
  const { openCreateModal } = useNoteModalStore();

  const focusSearch = useCallback(() => {
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[placeholder*="Tìm kiếm"], input[placeholder*="Search"]',
    );
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  const shortcuts: KeyboardShortcut[] = [
    {
      key: "n",
      ctrl: true,
      action: () => openCreateModal(),
      description: "Tạo ghi chú mới",
    },
    {
      key: "k",
      ctrl: true,
      action: focusSearch,
      description: "Tìm kiếm",
    },
    {
      key: "/",
      action: focusSearch,
      description: "Tìm kiếm (phím tắt)",
    },
    {
      key: "h",
      ctrl: true,
      action: () => navigate("/"),
      description: "Về trang chủ",
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

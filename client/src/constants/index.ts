import { SortOption } from "@/types";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Sort options - Tiếng Việt
export const SORT_OPTIONS: SortOption[] = [
  { label: "Mới nhất", value: "createdAt", order: "desc" },
  { label: "Cũ nhất", value: "createdAt", order: "asc" },
  { label: "Cập nhật gần đây", value: "updatedAt", order: "desc" },
  { label: "Tên A → Z", value: "title", order: "asc" },
  { label: "Tên Z → A", value: "title", order: "desc" },
];

// Folder sort options - Tiếng Việt
export const FOLDER_SORT_OPTIONS: SortOption[] = [
  { label: "Thứ tự mặc định", value: "order", order: "asc" },
  { label: "Tên A → Z", value: "name", order: "asc" },
  { label: "Tên Z → A", value: "name", order: "desc" },
  { label: "Nhiều ghi chú nhất", value: "notesCount", order: "desc" },
  { label: "Ít ghi chú nhất", value: "notesCount", order: "asc" },
];

export const DEFAULT_PAGE_SIZE = 20;

export const NOTE_COLORS = [
  { name: "Default", value: null },
  { name: "Red", value: "#fecaca" },
  { name: "Orange", value: "#fed7aa" },
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Purple", value: "#ddd6fe" },
  { name: "Pink", value: "#fbcfe8" },
];

export const FOLDER_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#6366f1", // Indigo
];

export const FOLDER_ICONS = [
  "folder",
  "briefcase",
  "user",
  "lightbulb",
  "folder-kanban",
  "graduation-cap",
  "star",
  "heart",
  "bookmark",
  "code",
  "music",
  "image",
  "file-text",
  "calendar",
  "home",
];

export const DEBOUNCE_DELAY = 300;

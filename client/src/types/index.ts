// Folder types
export interface Folder {
  _id: string;
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  notesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderInput {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateFolderInput {
  name?: string;
  color?: string;
  icon?: string;
  order?: number;
}

// Note types
export interface Note {
  _id: string;
  id: string;
  title: string;
  content: string;
  preview: string;
  folderId: Folder | null;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  color: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  folderId?: string | null;
  tags?: string[];
  color?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  folderId?: string | null;
  tags?: string[];
  color?: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  notes: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface NotesQueryParams {
  folderId?: string;
  search?: string;
  tag?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

// UI types
export interface SidebarState {
  isOpen: boolean;
  activeFolder: string | null;
}

export type SortOption = {
  label: string;
  value: string;
  order: "asc" | "desc";
};

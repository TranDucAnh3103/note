import api from "./client";
import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  NotesQueryParams,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

export const noteApi = {
  // Get all notes with filters
  getAll: async (
    params?: NotesQueryParams,
  ): Promise<PaginatedResponse<Note>> => {
    const response = await api.get<never, ApiResponse<PaginatedResponse<Note>>>(
      "/notes",
      {
        params,
      },
    );
    return response.data;
  },

  // Get note by ID
  getById: async (id: string): Promise<Note> => {
    const response = await api.get<never, ApiResponse<Note>>(`/notes/${id}`);
    return response.data;
  },

  // Create note
  create: async (data: CreateNoteInput): Promise<Note> => {
    const response = await api.post<never, ApiResponse<Note>>("/notes", data);
    return response.data;
  },

  // Update note
  update: async (id: string, data: UpdateNoteInput): Promise<Note> => {
    const response = await api.put<never, ApiResponse<Note>>(
      `/notes/${id}`,
      data,
    );
    return response.data;
  },

  // Delete note
  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },

  // Toggle pin
  togglePin: async (id: string): Promise<Note> => {
    const response = await api.patch<never, ApiResponse<Note>>(
      `/notes/${id}/pin`,
    );
    return response.data;
  },

  // Toggle archive
  toggleArchive: async (id: string): Promise<Note> => {
    const response = await api.patch<never, ApiResponse<Note>>(
      `/notes/${id}/archive`,
    );
    return response.data;
  },

  // Get all tags
  getTags: async (): Promise<string[]> => {
    const response = await api.get<never, ApiResponse<string[]>>("/notes/tags");
    return response.data;
  },

  // Delete a tag from all notes
  deleteTag: async (
    tag: string,
  ): Promise<{ modifiedCount: number; message: string }> => {
    const response = await api.delete<
      never,
      ApiResponse<{ modifiedCount: number; message: string }>
    >(`/notes/tags/${encodeURIComponent(tag)}`);
    return response.data;
  },

  // Rename a tag globally
  renameTag: async (
    oldTag: string,
    newTag: string,
  ): Promise<{ modifiedCount: number; message: string }> => {
    const response = await api.patch<
      never,
      ApiResponse<{ modifiedCount: number; message: string }>
    >("/notes/tags/rename", { oldTag, newTag });
    return response.data;
  },

  // Move notes to folder
  moveToFolder: async (
    noteIds: string[],
    folderId: string | null,
  ): Promise<Note[]> => {
    const response = await api.patch<never, ApiResponse<Note[]>>(
      "/notes/move",
      {
        noteIds,
        folderId,
      },
    );
    return response.data;
  },

  // Bulk delete notes
  bulkDelete: async (noteIds: string[]): Promise<{ deletedCount: number }> => {
    const response = await api.post<
      never,
      ApiResponse<{ deletedCount: number }>
    >("/notes/bulk-delete", { noteIds });
    return response.data;
  },
};

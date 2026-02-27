import api from "./client";
import type {
  Folder,
  CreateFolderInput,
  UpdateFolderInput,
  ApiResponse,
} from "@/types";

export const folderApi = {
  // Get all folders
  getAll: async (): Promise<Folder[]> => {
    const response = await api.get<never, ApiResponse<Folder[]>>("/folders");
    return response.data;
  },

  // Get folder by ID
  getById: async (id: string): Promise<Folder> => {
    const response = await api.get<never, ApiResponse<Folder>>(
      `/folders/${id}`,
    );
    return response.data;
  },

  // Create folder
  create: async (data: CreateFolderInput): Promise<Folder> => {
    const response = await api.post<never, ApiResponse<Folder>>(
      "/folders",
      data,
    );
    return response.data;
  },

  // Update folder
  update: async (id: string, data: UpdateFolderInput): Promise<Folder> => {
    const response = await api.put<never, ApiResponse<Folder>>(
      `/folders/${id}`,
      data,
    );
    return response.data;
  },

  // Delete folder
  delete: async (id: string): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },

  // Reorder folders
  reorder: async (
    folders: { id: string; order: number }[],
  ): Promise<Folder[]> => {
    const response = await api.patch<never, ApiResponse<Folder[]>>(
      "/folders/reorder",
      {
        folders,
      },
    );
    return response.data;
  },
};

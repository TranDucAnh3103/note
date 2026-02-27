import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { folderApi } from "@/api/folders";
import type { CreateFolderInput, UpdateFolderInput } from "@/types";
import toast from "react-hot-toast";

export const FOLDERS_QUERY_KEY = ["folders"];

export const useFolders = () => {
  return useQuery({
    queryKey: FOLDERS_QUERY_KEY,
    queryFn: folderApi.getAll,
  });
};

export const useFolder = (id: string) => {
  return useQuery({
    queryKey: [...FOLDERS_QUERY_KEY, id],
    queryFn: () => folderApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFolderInput) => folderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
      toast.success("Folder created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderInput }) =>
      folderApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
      toast.success("Folder updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => folderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
      toast.success("Folder deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

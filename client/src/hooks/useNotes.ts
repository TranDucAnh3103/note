import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { noteApi } from "@/api/notes";
import type {
  CreateNoteInput,
  UpdateNoteInput,
  NotesQueryParams,
} from "@/types";
import toast from "react-hot-toast";
import { FOLDERS_QUERY_KEY } from "./useFolders";

export const NOTES_QUERY_KEY = ["notes"];
export const TAGS_QUERY_KEY = ["tags"];

export const useNotes = (params?: NotesQueryParams) => {
  return useQuery({
    queryKey: [...NOTES_QUERY_KEY, params],
    queryFn: () => noteApi.getAll(params),
  });
};

export const useInfiniteNotes = (params?: Omit<NotesQueryParams, "page">) => {
  return useInfiniteQuery({
    queryKey: [...NOTES_QUERY_KEY, "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      noteApi.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });
};

export const useNote = (id: string) => {
  return useQuery({
    queryKey: [...NOTES_QUERY_KEY, id],
    queryFn: () => noteApi.getById(id),
    enabled: !!id,
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: noteApi.getTags,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteInput) => noteApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
      toast.success("Note created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteInput }) =>
      noteApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...NOTES_QUERY_KEY, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
      toast.success("Note updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
      toast.success("Note deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useTogglePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteApi.togglePin(id),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      toast.success(note.isPinned ? "Note pinned" : "Note unpinned");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useToggleArchive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteApi.toggleArchive(id),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
      toast.success(note.isArchived ? "Note archived" : "Note unarchived");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useMoveNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteIds,
      folderId,
    }: {
      noteIds: string[];
      folderId: string | null;
    }) => noteApi.moveToFolder(noteIds, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
      toast.success("Notes moved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkDeleteNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteIds: string[]) => noteApi.bulkDelete(noteIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
      toast.success(`${result.deletedCount} notes deleted`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tag: string) => noteApi.deleteTag(tag),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
      toast.success(`Đã xóa thẻ "${result.message.split('"')[1]}"`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useRenameTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ oldTag, newTag }: { oldTag: string; newTag: string }) =>
      noteApi.renameTag(oldTag, newTag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
      toast.success("Đã đổi tên thẻ");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

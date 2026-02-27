import { create } from "zustand";
import type { Note } from "@/types";

interface NoteModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  note: Note | null;
  folderId: string | null;
  openCreateModal: (folderId?: string | null) => void;
  openEditModal: (note: Note) => void;
  closeModal: () => void;
}

export const useNoteModalStore = create<NoteModalState>((set) => ({
  isOpen: false,
  mode: "create",
  note: null,
  folderId: null,
  openCreateModal: (folderId = null) =>
    set({
      isOpen: true,
      mode: "create",
      note: null,
      folderId,
    }),
  openEditModal: (note) =>
    set({
      isOpen: true,
      mode: "edit",
      note,
      folderId: null,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      note: null,
      folderId: null,
    }),
}));

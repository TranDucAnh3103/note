import { create } from "zustand";

interface ImportModalState {
  isOpen: boolean;
  targetFolderId: string | null;
  openModal: (folderId?: string | null) => void;
  closeModal: () => void;
}

export const useImportModalStore = create<ImportModalState>((set) => ({
  isOpen: false,
  targetFolderId: null,
  openModal: (folderId = null) =>
    set({
      isOpen: true,
      targetFolderId: folderId,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      targetFolderId: null,
    }),
}));

import { create } from "zustand";

interface FolderModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  folderId: string | null;
  folderName: string;
  folderColor: string;
  folderIcon: string;
  openCreateModal: () => void;
  openEditModal: (
    id: string,
    name: string,
    color: string,
    icon: string,
  ) => void;
  closeModal: () => void;
}

export const useFolderModalStore = create<FolderModalState>((set) => ({
  isOpen: false,
  mode: "create",
  folderId: null,
  folderName: "",
  folderColor: "#6366f1",
  folderIcon: "folder",
  openCreateModal: () =>
    set({
      isOpen: true,
      mode: "create",
      folderId: null,
      folderName: "",
      folderColor: "#6366f1",
      folderIcon: "folder",
    }),
  openEditModal: (id, name, color, icon) =>
    set({
      isOpen: true,
      mode: "edit",
      folderId: id,
      folderName: name,
      folderColor: color,
      folderIcon: icon,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      folderId: null,
      folderName: "",
      folderColor: "#6366f1",
      folderIcon: "folder",
    }),
}));

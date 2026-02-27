import { create } from "zustand";
import type { SortOption } from "@/types";
import { SORT_OPTIONS } from "@/constants";

interface SearchState {
  searchQuery: string;
  selectedSort: SortOption;
  setSearchQuery: (query: string) => void;
  setSelectedSort: (sort: SortOption) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: "",
  selectedSort: SORT_OPTIONS[0],
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedSort: (sort) => set({ selectedSort: sort }),
  clearSearch: () => set({ searchQuery: "" }),
}));

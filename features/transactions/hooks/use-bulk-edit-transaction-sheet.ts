import { create } from "zustand";

type BulkEditTransactionState = {
  ids: string[];
  isOpen: boolean;
  onOpen: (ids: string[]) => void;
  onClose: () => void;
};

export const useBulkEditTransactionSheet = create<BulkEditTransactionState>(
  (set) => ({
    ids: [],
    isOpen: false,
    onOpen: (ids: string[]) => set({ isOpen: true, ids }),
    onClose: () => set({ isOpen: false, ids: undefined }),
  })
);

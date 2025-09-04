import { create } from "zustand";

export type Filters = { q: string; category: string | "Усі"; onlyAvailable: boolean };
type Store = {
  filters: Filters;
  setQ: (q: string) => void;
  setCategory: (c: Filters["category"]) => void;
  toggleAvailable: () => void;
};
export const useStore = create<Store>((set) => ({
  filters: { q: "", category: "Усі", onlyAvailable: false },
  setQ: (q) => set((s) => ({ filters: { ...s.filters, q } })),
  setCategory: (category) => set((s) => ({ filters: { ...s.filters, category } })),
  toggleAvailable: () => set((s) => ({ filters: { ...s.filters, onlyAvailable: !s.filters.onlyAvailable } })),
}));

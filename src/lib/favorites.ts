import { create } from "zustand";

type FavStore = {
  ids: Set<string>;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

const load = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("stefa_favs");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
};

export const useFavorites = create<FavStore>((set, get) => ({
  ids: load(),
  toggle: (id) => {
    const ids = new Set(get().ids);
    if (ids.has(id)) {
      ids.delete(id);
    } else {
      ids.add(id);
    }
    set({ ids });
    if (typeof window !== "undefined") localStorage.setItem("stefa_favs", JSON.stringify(Array.from(ids)));
  },
  has: (id) => get().ids.has(id),
}));

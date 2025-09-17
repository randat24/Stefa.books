import { create } from "zustand";

export type Plan = "mini" | "maxi" | null;

type UIState = {
  selectedPlan: Plan;
  setSelectedPlan: (p: Plan) => void;
  clearPlan: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  selectedPlan: null,
  setSelectedPlan: (p) => set({ selectedPlan: p }),
  clearPlan: () => set({ selectedPlan: null }) }));

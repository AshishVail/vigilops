"use client";

import { create } from "zustand";
import type { ApiAuth, HttpMethod } from "@/lib/types/observatory";

export type DraftParam = { key: string; value: string; enabled: boolean };

type ObservatoryDraft = {
  method: HttpMethod;
  url: string;
  queryParams: DraftParam[];
  headers: DraftParam[];
  auth: ApiAuth;
  body: string;
};

type ObservatoryStore = {
  draft: ObservatoryDraft;
  setDraft: (draft: Partial<ObservatoryDraft>) => void;
  resetDraft: () => void;
};

const initialDraft: ObservatoryDraft = {
  method: "GET",
  url: "",
  queryParams: [],
  headers: [],
  auth: { type: "none" },
  body: "{}",
};

export const useObservatoryStore = create<ObservatoryStore>((set) => ({
  draft: initialDraft,
  setDraft: (draft) =>
    set((state) => ({
      draft: { ...state.draft, ...draft },
    })),
  resetDraft: () => set({ draft: initialDraft }),
}));

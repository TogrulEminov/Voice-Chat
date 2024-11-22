import { create } from "zustand";

export const useDashboardStore = create((set) => ({
  feedback: "",
  refresh: false,
  transcribedText: "",
  asistantAudioUrl: null,
  userAudioUrl: null,

  setFeedback: (feedback) =>
    set(() => ({
      feedback, // Yalnız `feedback` vəziyyətini yeniləyir
      
    })),

  setTranscribedText: (text) =>
    set(() => ({
      transcribedText: text,
    })),
  setAsistantAudioUrl: (url) =>
    set((state) => ({ ...state, asistantAudioUrl: url })),

  setUserAudioUrl: (url) =>
    set(() => ({
      userAudioUrl: url,
    })),

  toggleRefresh: () =>
    set((state) => ({
      refresh: !state.refresh,
    })),
}));

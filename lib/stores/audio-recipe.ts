import { create } from "zustand"
import type { ExtractedRecipe } from "@/types"

interface AudioRecipeState {
  data: ExtractedRecipe | null
  setData: (data: ExtractedRecipe) => void
  clear: () => void
}

// Holds extracted recipe data from the audio page until the form consumes it
export const useAudioRecipeStore = create<AudioRecipeState>((set) => ({
  data: null,
  setData: (data) => set({ data }),
  clear: () => set({ data: null }),
}))

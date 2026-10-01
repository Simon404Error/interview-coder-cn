import { create } from 'zustand'

interface SolutionState {
  isLoading: boolean
  solutionChunks: string[]
  /**
   * What the model reasoned before each answer, one entry per request round.
   * Empty for non-thinking models; rounds are separated because appended
   * screenshots and follow-ups each bring their own reasoning.
   */
  reasoningRounds: string[][]
  screenshotData: string | null
  errorMessage: string | null
  /** How long the last request took, in ms; null until one has finished */
  durationMs: number | null
}

interface SolutionStore extends SolutionState {
  setIsLoading: (isReceiving: boolean) => void
  addSolutionChunk: (chunk: string) => void
  addReasoningChunk: (chunk: string) => void
  /** Begin a new reasoning round for the next request's reasoning */
  startReasoningRound: () => void
  setSolutionChunks: (chunks: string[]) => void
  setScreenshotData: (data: string | null) => void
  setErrorMessage: (message: string | null) => void
  setDurationMs: (ms: number | null) => void
  clearSolution: () => void
  resetState: () => void
}

const defaultState: SolutionState = {
  isLoading: false,
  solutionChunks: [],
  reasoningRounds: [],
  screenshotData: null,
  errorMessage: null,
  durationMs: null
}

export const useSolutionStore = create<SolutionStore>()((set) => ({
  ...defaultState,
  setIsLoading: (isReceiving) => {
    set({ isLoading: isReceiving })
  },
  addSolutionChunk: (chunk) => {
    set((state) => ({
      solutionChunks: [...state.solutionChunks, chunk]
    }))
  },
  addReasoningChunk: (chunk) => {
    set((state) => {
      const rounds = state.reasoningRounds.length > 0 ? state.reasoningRounds : [[]]
      return { reasoningRounds: [...rounds.slice(0, -1), [...rounds[rounds.length - 1], chunk]] }
    })
  },
  startReasoningRound: () => {
    set((state) => {
      const last = state.reasoningRounds.at(-1)
      // Nothing to separate: the new round would sit next to an empty one
      if (!last || last.length === 0) return {}
      return { reasoningRounds: [...state.reasoningRounds, []] }
    })
  },
  setSolutionChunks: (chunks) => {
    set({ solutionChunks: chunks })
  },
  setScreenshotData: (data) => {
    set({ screenshotData: data })
  },
  setErrorMessage: (message) => {
    set({ errorMessage: message })
  },
  setDurationMs: (ms) => {
    set({ durationMs: ms })
  },
  clearSolution: () => {
    // A new request is starting, so the previous timing no longer applies
    set({
      solutionChunks: [],
      reasoningRounds: [],
      isLoading: false,
      errorMessage: null,
      durationMs: null
    })
  },
  resetState: () => {
    set(defaultState)
  }
}))

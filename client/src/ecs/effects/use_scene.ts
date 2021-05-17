import { createEffect } from "@javelin/ecs"
import { CanvasRef } from "../../Canvas"

type UseSceneState = {
  start(): void
  stop(): void
} & ({ ready: false; canvas: null } | { ready: true; canvas: CanvasRef })

export const useScene = createEffect(() => {
  const start = () => {}
  const stop = () => {}
  const state = { start, stop, ready: false, canvas: null } as UseSceneState
  return function useScene(canvas: CanvasRef | null) {
    if (canvas !== null && state.ready === false) {
      Object.assign(state, { canvas, ready: true })
      canvas.context?.scale(20, -20)
    }
    return state
  }
})

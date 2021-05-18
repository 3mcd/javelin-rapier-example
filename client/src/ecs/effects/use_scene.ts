import { createEffect, World } from "@javelin/ecs"
import { CanvasRef } from "../../Canvas"
import { WorldTickData } from "../types"

export const CANVAS_SCALE = 25

type UseSceneState = {
  start(): void
  stop(): void
} & ({ ready: false; canvas: null } | { ready: true; canvas: CanvasRef })

export const useScene = createEffect(
  // @ts-ignore
  (world: World<WorldTickData>) => {
    const state = { ready: false, canvas: null } as UseSceneState
    return function useScene() {
      const canvas = world.state.currentTickData.canvas
      if (canvas !== null && state.ready === false) {
        Object.assign(state, { canvas, ready: true })
        canvas.context?.scale(CANVAS_SCALE, -CANVAS_SCALE)
      }
      if (canvas?.context) {
        canvas.context.clearRect(0, 0, canvas.width, -canvas.height)
      }
      return state
    }
  },
  { global: true },
)

import { createEffect } from "@javelin/ecs"
// @ts-ignore
import Stats from "stats.js"

export const useStats = createEffect(
  () => {
    const stats = new Stats()
    stats.showPanel(1)
    document.body.appendChild(stats.dom)
    return () => {
      stats.begin()
      return stats
    }
  },
  { global: true },
)

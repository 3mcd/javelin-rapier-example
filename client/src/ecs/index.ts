import { createWorld } from "@javelin/ecs"
import { useStats } from "./effects"
import * as Systems from "./systems"
import { WorldTickData } from "./types"

export * from "./schema"
export const world = createWorld<WorldTickData>({
  systems: [
    () => useStats(),
    ...Object.values(Systems),
    () => useStats().end(),
  ],
})

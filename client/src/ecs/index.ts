import { createWorld } from "@javelin/ecs"
import * as Systems from "./systems"
import { WorldTickData } from "./types"

export * from "./schema"
export const world = createWorld<WorldTickData>({
  systems: Object.values(Systems),
})

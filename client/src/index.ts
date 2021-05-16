import { createWorld } from "@javelin/ecs"
import * as Systems from "./systems"

const world = createWorld<void>({ systems: Object.values(Systems) })

setInterval(() => {
  world.tick()
}, (1 / 60) * 1000)

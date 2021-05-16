import { createWorld } from "@javelin/ecs"
import * as Systems from "./systems"

const world = createWorld({
  systems: Object.values(Systems),
})

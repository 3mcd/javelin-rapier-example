import { createWorld } from "@javelin/ecs"
import { Clock, createHrtimeLoop } from "@javelin/hrtime-loop"
import * as Env from "./env"
import { server } from "./net"
import * as Systems from "./systems"

const world = createWorld<Clock>({
  systems: Object.values(Systems),
})

const loop = createHrtimeLoop((1 / Env.TICK_RATE) * 1000, clock =>
  world.tick(clock),
)

loop.start()
server.listen(Env.PORT)

console.log(`
Server started!
${Object.entries(Env)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}
`)

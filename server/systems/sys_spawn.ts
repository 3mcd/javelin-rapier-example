import { createQuery, useMonitor, World } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { Fighter } from "../../common/prefabs"
import { Player } from "../../common/schema"

const qryPlayers = createQuery(Player)

export const sysSpawn = (world: World<Clock>) => {
  useMonitor(qryPlayers, e => Fighter.attach(e, world))
}

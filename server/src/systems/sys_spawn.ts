import { useInterval, useMonitor, useRef, World } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { Fighter } from "../../../common"
import { qryPlayers } from "../queries"

export const sysSpawn = (world: World<Clock>) => {
  const spawned = useRef(0)
  const spawn = useInterval(100) && spawned.value < 10

  useMonitor(qryPlayers, e => {
    const width = Math.max(0.5, Math.random() * 2)
    Fighter.attach(
      e,
      world,
      (1 - Math.random() * 2) * 5,
      20 + (1 - Math.random() * 2) * 5,
      width,
      width,
    )
  })

  if (spawn) {
    spawned.value++
    const width = Math.max(0.5, Math.random() * 2)
    Fighter.spawn(
      world,
      (1 - Math.random() * 2) * 5,
      20 + (1 - Math.random() * 2) * 5,
      width,
      width,
    )
  }
}

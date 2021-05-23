import { useInterval, useMonitor, useRef, World } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { Crate } from "../../../common"
import { qryPlayers } from "../queries"

export const sysSpawn = (world: World<Clock>) => {
  const spawned = useRef(0)
  const spawn = useInterval(500) && spawned.value < 1000

  useMonitor(qryPlayers, e => {
    const width = Math.max(0.5, Math.random() * 2)
    Crate.attach(
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
    Crate.spawn(
      world,
      (1 - Math.random() * 2) * 5,
      20 + (1 - Math.random() * 2) * 5,
      width,
      width,
    )
  }
}

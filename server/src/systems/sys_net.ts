import { Component, Entity, useInterval, useMonitor, World } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { encode } from "@javelin/net"
import { reset } from "@javelin/track"
import { Crate, Player, Transform } from "../../../common"
import { useClients } from "../effects"
import { SEND_RATE } from "../env"
import { qryBodiesWChanges, qryBoxesStatic, qryPlayers } from "../queries"

export const sysNet = ({ tryGet }: World<Clock>) => {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const { clients } = useClients()

  const syncMonitorAttach = (e: Entity, components: Component[]) =>
    clients.forEach(client => client.producer.attach(e, components))
  const syncMonitorDetach = (e: Entity, components: Component[]) =>
    clients.forEach(client => client.producer.detach(e, components))

  useMonitor(qryPlayers, syncMonitorAttach, syncMonitorDetach)
  useMonitor(qryBoxesStatic, syncMonitorAttach, syncMonitorDetach)
  useMonitor(Crate.query, syncMonitorAttach, syncMonitorDetach)
  if (send) {
    for (const [entities, [players]] of qryPlayers) {
      for (let i = 0; i < entities.length; i++) {
        const { clientId } = players[i]
        const client = clients.get(clientId)
        const playerTransform = tryGet(entities[i], Transform)
        if (client === undefined) {
          continue
        }
        for (const [entities, [transforms, changes]] of qryBodiesWChanges) {
          for (let i = 0; i < entities.length; i++) {
            const { x, y } = transforms[i]
            let distance: number
            if (playerTransform) {
              distance = Math.hypot(
                playerTransform.x - x,
                playerTransform.y - y,
              )
            } else {
              distance = Math.hypot(x, y)
            }
            client.producerU.patch(entities[i], changes[i], 1 / distance)
          }
        }
        const message = client.producer.take()
        const messageU = client.producerU.take()
        if (message) {
          client.connection?.send(encode(message))
        }
        if (messageU) {
          // TODO: unreliable connection
          // client.connectionU?.send(encode(messageU))
          client.connection?.send(encode(messageU))
        }
      }
    }
    for (const [entities, [, changes]] of qryBodiesWChanges) {
      for (let i = 0; i < entities.length; i++) {
        reset(changes[i])
      }
    }
  }
}

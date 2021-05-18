import { createQuery, useInterval, useMonitor } from "@javelin/ecs"
import { encode } from "@javelin/net"
import { ChangeSet, reset } from "@javelin/track"
import { Box, Fighter, Player, Transform, Velocity } from "../../../common"
import { useClients } from "../effects"
import { SEND_RATE } from "../env"

const qryPlayers = createQuery(Player)
const qryStatic = createQuery(Transform, Box).not(Velocity)
const qryBodiesWChanges = createQuery(Transform, ChangeSet)

export const sysNet = () => {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const { clients } = useClients()

  useMonitor(
    Fighter.query,
    e =>
      qryPlayers((_, [{ clientId }]) =>
        clients.get(clientId)?.producer.spawn(e, Fighter.query.get(e)),
      ),
    e =>
      qryPlayers((_, [{ clientId }]) =>
        clients.get(clientId)?.producer.destroy(e),
      ),
  )
  useMonitor(
    qryStatic,
    e =>
      qryPlayers((_, [{ clientId }]) =>
        clients.get(clientId)?.producer.spawn(e, qryStatic.get(e)),
      ),
    e =>
      qryPlayers((_, [{ clientId }]) =>
        clients.get(clientId)?.producer.destroy(e),
      ),
  )

  if (send) {
    for (const [entities, [players]] of qryPlayers) {
      for (let i = 0; i < entities.length; i++) {
        const { clientId } = players[i]
        const client = clients.get(clientId)
        if (client === undefined) {
          continue
        }
        for (const [entities, [, changes]] of qryBodiesWChanges) {
          for (let i = 0; i < entities.length; i++) {
            client.producerU.patch(entities[i], changes[i], 1)
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

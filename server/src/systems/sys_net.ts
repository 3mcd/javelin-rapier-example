import { useInterval, useMonitor } from "@javelin/ecs"
import { encode } from "@javelin/net"
import { reset } from "@javelin/track"
import { Fighter } from "../../../common"
import { useClients } from "../effects"
import { SEND_RATE } from "../env"
import { qryBodiesWChanges, qryBoxesStatic, qryPlayers } from "../queries"

export const sysNet = () => {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const { clients } = useClients()

  useMonitor(
    qryPlayers,
    (e, results) =>
      clients.forEach(client => client.producer.attach(e, results)),
    (e, results) =>
      clients.forEach(client => client.producer.detach(e, results)),
  )
  useMonitor(
    Fighter.query,
    e =>
      clients.forEach(client =>
        client.producer.attach(e, Fighter.query.get(e)),
      ),
    e =>
      clients.forEach(client =>
        client.producer.detach(e, Fighter.query.get(e)),
      ),
  )
  useMonitor(
    qryBoxesStatic,
    (e, results) =>
      clients.forEach(client => client.producer.attach(e, results)),
    (e, results) =>
      clients.forEach(client => client.producer.detach(e, results)),
  )

  if (send) {
    for (const [entities, [players]] of qryPlayers) {
      for (let i = 0; i < entities.length; i++) {
        const { clientId } = players[i]
        const client = clients.get(clientId)
        if (client === undefined) {
          continue
        }
        for (const [entities, [transforms, changes]] of qryBodiesWChanges) {
          for (let i = 0; i < entities.length; i++) {
            const { x, y } = transforms[i]
            client.producerU.patch(
              entities[i],
              changes[i],
              1 / Math.sqrt(x ** 2 + y ** 2),
            )
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

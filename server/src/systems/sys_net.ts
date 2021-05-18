import { createQuery, useInterval, useMonitor } from "@javelin/ecs"
import { encode } from "@javelin/net"
import { ChangeSet, reset } from "@javelin/track"
import {
  Box,
  Fighter,
  Health,
  Player,
  Transform,
  Velocity,
} from "../../../common"
import { useClients } from "../effects"
import { SEND_RATE } from "../env"
import { qryBodiesWChanges, qryBoxesStatic, qryPlayers } from "../queries"

// useMonitor resets for each new query. Should make it when signature changes...
const needToLookIntoThis = Fighter.query.not(Player)
const sigh = createQuery(Transform, Velocity, Box, Health, ChangeSet)

export const sysNet = () => {
  const send = useInterval((1 / SEND_RATE) * 1000)
  const { clients } = useClients()

  useMonitor(
    qryPlayers,
    (e, [p]) => clients.forEach(client => client.producer.spawn(e, [p])),
    e => clients.forEach(client => client.producer.destroy(e)),
  )
  // useMonitor(
  //   needToLookIntoThis,
  //   e => {
  //     console.log(e)
  //     clients.forEach(client => client.producer.spawn(e, Fighter.query.get(e)))
  //   },
  //   e => clients.forEach(client => client.producer.destroy(e)),
  // )
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
    e =>
      clients.forEach(client =>
        client.producer.spawn(e, qryBoxesStatic.get(e)),
      ),
    e => clients.forEach(client => client.producer.destroy(e)),
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

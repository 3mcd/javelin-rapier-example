import { component, createEffect, createQuery, Entity } from "@javelin/ecs"
import {
  attach,
  createMessage,
  createMessageProducer,
  encode,
  MessageProducer,
  model,
} from "@javelin/net"
import { Connection } from "@web-udp/client"
import {
  assert,
  ConnectionMetadata,
  ConnectionType,
  Fighter,
  isConnectionMetadata,
  Player,
} from "../../../common"
import { MESSAGE_MAX_BYTE_LENGTH } from "../env"
import { udp } from "../net"
import { qryBoxesStatic } from "../queries"

export type Client = {
  id: string
  entity: Entity
  producer: MessageProducer
  producerU: MessageProducer
  connection: Connection | null
  connectionU: Connection | null
}

export const useClients = createEffect(world => {
  const { spawn, destroy } = world
  const clients = new Map<string, Client>()
  const qryPlayers = createQuery(Player).bind(world)
  const sendInitialMessage = (client: Client) => {
    const message = createMessage()
    model(message)
    qryPlayers((e, components) => attach(message, e, components))
    Fighter.query.bind(world)((e, components) => attach(message, e, components))
    qryBoxesStatic.bind(world)((e, components) =>
      attach(message, e, components),
    )
    client.connection.send(encode(message))
  }
  const findOrCreateClient = (
    connection: Connection,
    { clientId, type }: ConnectionMetadata,
  ) => {
    let client = clients.get(clientId)
    if (client === undefined) {
      let entity: Entity
      outer: for (const [entities, [players]] of qryPlayers) {
        for (let i = 0; i < entities.length; i++) {
          const p = players[i]
          if (p.clientId === clientId) {
            entity = entities[i]
            break outer
          }
        }
      }
      if (entity === undefined) {
        entity = spawn(component(Player, { clientId }))
      }
      client = {
        id: clientId,
        entity,
        producer: createMessageProducer({
          maxByteLength: MESSAGE_MAX_BYTE_LENGTH,
        }),
        producerU: createMessageProducer({
          maxByteLength: MESSAGE_MAX_BYTE_LENGTH,
        }),
        connection: null,
        connectionU: null,
      }
      clients.set(clientId, client)
    }
    if (type === ConnectionType.Reliable) {
      if (client.connection) {
        client.connection.close()
      }
      client.connection = connection
      sendInitialMessage(client)
    }
    if (type === ConnectionType.Unreliable) {
      if (client.connectionU) {
        client.connectionU.close()
      }
      client.connectionU = connection
    }
    return client
  }
  udp.connections.subscribe(connection => {
    try {
      const { metadata } = connection
      assert(
        isConnectionMetadata(metadata),
        "Failed to connect: invalid metadata",
      )
      const client = findOrCreateClient(connection, metadata)
      connection.closed.subscribe(() => {
        // destroy(client.entity)
        client.connection?.close()
        client.connectionU?.close()
        clients.delete(metadata.clientId)
      })
    } catch (error) {
      console.error(error)
      connection.send({ error: error.message })
    }
  })
  const api = { clients }

  return function effClients() {
    return api
  }
})

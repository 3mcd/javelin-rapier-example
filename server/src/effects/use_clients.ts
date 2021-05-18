import { component, createEffect, createQuery, Entity } from "@javelin/ecs"
import { createMessageProducer, MessageProducer } from "@javelin/net"
import { Connection } from "@web-udp/client"
import {
  assert,
  Box,
  ConnectionMetadata,
  ConnectionType,
  Fighter,
  isConnectionMetadata,
  Player,
  Transform,
  Velocity,
} from "../../../common"
import { MESSAGE_MAX_BYTE_LENGTH } from "../env"
import { udp } from "../net"

export type Client = {
  id: string
  entity: Entity
  producer: MessageProducer
  producerU: MessageProducer
  connection: Connection | null
  connectionU: Connection | null
}

const qryStatic = createQuery(Transform, Box).not(Velocity)

export const useClients = createEffect(world => {
  const { spawn, destroy } = world
  const clients = new Map<string, Client>()
  const qryPlayers = createQuery(Player).bind(world)
  const initialize = (client: Client) => {
    Fighter.query.bind(world)(client.producer.spawn)
    qryStatic.bind(world)(client.producer.spawn)
    client.producer.model()
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
      initialize(client)
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

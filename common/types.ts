export enum ConnectionType {
  Reliable,
  Unreliable,
}

export type ConnectionMetadata = {
  clientId: string
  type: ConnectionType
}

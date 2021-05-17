import { ConnectionMetadata } from "./types"

export const isConnectionMetadata = (
  object: unknown,
): object is ConnectionMetadata =>
  typeof object === "object" &&
  object !== null &&
  typeof Reflect.get(object, "clientId") === "string" &&
  typeof Reflect.get(object, "type") === "number"

export function assert(
  expression: boolean,
  message: string = "",
): asserts expression {
  if (!expression) {
    throw new Error(message)
  }
}

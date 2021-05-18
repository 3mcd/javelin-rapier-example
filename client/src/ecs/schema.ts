import { arrayOf, number } from "@javelin/core"

export const Camera = {}

export const Interpolate = {
  x: number,
  y: number,
  angle: number,
  buffer: arrayOf(arrayOf(number)),
  adaptiveSendRate: number,
  lastUpdateTime: number,
}

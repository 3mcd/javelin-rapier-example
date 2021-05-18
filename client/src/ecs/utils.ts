import { ComponentOf } from "@javelin/ecs"
import { createStackPool } from "../pool"
import { Interpolate } from "./schema"

export const interpBufferPool = createStackPool<number[]>(
  () => [],
  ib => {
    ib.length = 0
    return ib
  },
  1000,
)

export const interpBufferInsert = (
  x: number,
  y: number,
  angle: number,
  ip: ComponentOf<typeof Interpolate>,
) => {
  const item = interpBufferPool.retain()
  item[0] = performance.now()
  item[1] = x
  item[2] = y
  item[3] = angle
  // @ts-ignore
  ip.buffer.push(item)
  return item
}

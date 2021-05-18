import { component, createQuery, useMonitor, World } from "@javelin/ecs"
import { Transform } from "../../../../common"
import { useConnect } from "../effects"
import { Interpolate } from "../schema"
import { WorldTickData } from "../types"
import { interpBufferInsert, interpBufferPool } from "../utils"

const qryTransforms = createQuery(Transform)
const qryTransformsWInterpolate = createQuery(Transform, Interpolate)

export const sysInterpolate = (world: World<WorldTickData>) => {
  const { patched, updated } = useConnect()
  const bufferTime = performance.now() - 1000

  useMonitor(
    qryTransforms,
    (e, [t]) =>
      t &&
      world.attach(
        e,
        component(Interpolate, { x: t.x, y: t.y, angle: t.angle }),
      ),
  )

  for (const [
    entities,
    [transforms, interpolates],
  ] of qryTransformsWInterpolate) {
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]
      const { x, y, angle } = transforms[i]
      const ip = interpolates[i]
      const { buffer } = ip

      if (patched.has(e) || updated.has(e)) {
        interpBufferInsert(x, y, angle, ip)
        const now = performance.now()
        ip.adaptiveSendRate = (now - bufferTime) / 1000
      }
      const renderTime = bufferTime / ip.adaptiveSendRate

      while (buffer.length >= 2 && buffer[1][0] <= renderTime) {
        const item = buffer.shift()
        if (item) {
          interpBufferPool.release(item)
        }
      }

      if (
        buffer.length >= 2 &&
        buffer[0][0] <= renderTime &&
        renderTime <= buffer[1][0]
      ) {
        const [[t0, x0, y0, a0], [t1, x1, y1, a1]] = buffer
        const dr = renderTime - t0
        const dt = t1 - t0
        ip.x = x0 + ((x1 - x0) * dr) / dt
        ip.y = y0 + ((y1 - y0) * dr) / dt
        ip.angle = rLerp(a0, a1, dr / dt)
      }
    }
  }
}

function rLerp(A: number, B: number, w: number) {
  let CS = (1 - w) * Math.cos(A) + w * Math.cos(B)
  let SN = (1 - w) * Math.sin(A) + w * Math.sin(B)
  return Math.atan2(SN, CS)
}

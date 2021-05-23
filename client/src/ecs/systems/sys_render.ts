import { component, createQuery, useRef, World } from "@javelin/ecs"
import { Crate, Player } from "../../../../common"
import { CANVAS_SCALE, useScene } from "../effects"
import { Camera, Interpolate } from "../schema"
import { Transform, Velocity, Box } from "../../../../common"
import { WorldTickData } from "../types"

const qryStatic = createQuery(Transform, Box).not(Velocity)

export const sysRender = ({ has, get, spawn }: World<WorldTickData>) => {
  const init = useRef(false)
  const scene = useScene()
  const context = scene.canvas?.context

  if (!(context && scene.ready)) {
    return
  }

  if (!init.value) {
    spawn(component(Camera))
    init.value = true
  }

  const hw = scene.canvas.width / CANVAS_SCALE / 2
  const hh = -scene.canvas.height / CANVAS_SCALE / 2

  context.translate(hw, hh)

  for (const [
    entities,
    [transforms, velocities, boxes, healths],
  ] of Crate.query) {
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]
      const { angle, x, y } = has(e, Interpolate)
        ? get(e, Interpolate)
        : transforms[i]
      const { width, height } = boxes[i]
      const hw = width / 2
      const hh = height / 2
      context.save()
      context.translate(x, y)
      context.rotate(angle)
      if (has(e, Player)) {
        context.fillStyle = "#7D80DA"
        context.fillRect(-hw, -hh, width, height)
      }
      context.lineWidth = 0.1
      context.strokeStyle = "#7D80DA"
      context.strokeRect(-hw, -hh, width, height)
      context.restore()
    }
  }
  for (const [entities, [transforms, boxes]] of qryStatic) {
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i]
      const { angle, x, y } = has(e, Interpolate)
        ? get(e, Interpolate)
        : transforms[i]
      const { width, height } = boxes[i]
      const hw = width / 2
      const hh = height / 2
      context.save()
      context.translate(x, y)
      context.rotate(angle)
      context.lineWidth = 0.1
      context.strokeStyle = "#CEBACF"
      context.strokeRect(-hw, -hh, width, height)
      context.restore()
    }
  }

  context.translate(-hw, -hh)
}

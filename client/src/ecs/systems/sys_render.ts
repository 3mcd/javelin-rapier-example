import { component, useRef, World } from "@javelin/ecs"
import { Fighter } from "../../../../common"
import { useScene } from "../effects"
import { Camera } from "../schema"
import { WorldTickData } from "../types"

export const sysRender = ({
  state: {
    currentTickData: { canvas },
  },
  spawn,
}: World<WorldTickData>) => {
  const init = useRef(false)
  const scene = useScene(canvas)
  if (!scene.ready) {
    return
  }
  if (!init.value) {
    spawn(component(Camera))
    init.value = true
  }
  scene.canvas.context?.clearRect(
    0,
    0,
    scene.canvas.width,
    -scene.canvas.height,
  )
  for (const [
    entities,
    [transforms, velocities, shapes, healths],
  ] of Fighter.query) {
    for (let i = 0; i < entities.length; i++) {
      const { x, y } = transforms[i]
      const { vertices } = shapes[i]
      scene.canvas.context?.fillRect(x, y, 1, 1)
    }
  }
}

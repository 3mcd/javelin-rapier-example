import { component, useRef, World } from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { Box, Transform } from "../../../common"
import { usePhysicsWorld } from "../effects"

export const sysPhysics = ({ create }: World<Clock>) => {
  const world = usePhysicsWorld()
  const init = useRef(true)

  if (init.value) {
    // Create the ground
    create(
      component(Transform, { x: 0, y: -10 }),
      component(Box, { width: 20, height: 1 }),
    )
    init.value = false
  }
}

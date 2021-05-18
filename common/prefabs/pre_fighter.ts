import { component, createQuery, Entity, World } from "@javelin/ecs"
import { ChangeSet } from "@javelin/track"
import { Box, Health, Transform, Velocity } from "../schema"

export const Fighter = {
  attach(
    entity: Entity,
    { attach }: World<unknown>,
    x = 0,
    y = 0,
    width = 1,
    height = 1,
  ) {
    attach(
      entity,
      component(Transform, { x, y }),
      component(Velocity),
      component(Box, {
        width,
        height,
      }),
      component(Health),
      component(ChangeSet),
    )
  },
  spawn(world: World<unknown>, x = 0, y = 0, width = 1, height = 1) {
    return world.spawn(
      component(Transform, { x, y }),
      component(Velocity),
      component(Box, {
        width,
        height,
      }),
      component(Health),
      component(ChangeSet),
    )
  },
  detach(entity: Entity, { detach }: World<unknown>) {
    detach(entity, Transform, Velocity, Box, Health, ChangeSet)
  },
  query: createQuery(Transform, Velocity, Box, Health, ChangeSet),
}

import { component, createQuery, Entity, World } from "@javelin/ecs"
import { ChangeSet } from "@javelin/track"
import { Box, Transform, Velocity } from "../schema"

export const Crate = {
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
      component(ChangeSet),
    )
  },
  spawn(world: World<unknown>, x = 0, y = 0, width = 1, height = 1) {
    const entity = world.reserve()
    Crate.attach(entity, world, x, y, width, height)
    return entity
  },
  detach(entity: Entity, { detach }: World<unknown>) {
    detach(entity, Transform, Velocity, Box, ChangeSet)
  },
  query: createQuery(Transform, Velocity, Box, ChangeSet),
}

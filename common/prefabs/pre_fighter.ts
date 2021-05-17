import { component, createQuery, Entity, World } from "@javelin/ecs"
import { ChangeSet } from "@javelin/track"
import { Health, Shape, Transform, Velocity } from "../schema"

export const Fighter = {
  attach(entity: Entity, { attach }: World<unknown>) {
    attach(
      entity,
      component(Transform),
      component(Velocity),
      component(Shape, {
        vertices: [
          [-1, 1],
          [1, 1],
          [1, -1],
          [-1, -1],
        ],
      }),
      component(Health),
      component(ChangeSet),
    )
  },
  detach(entity: Entity, { detach }: World<unknown>) {
    detach(entity, Transform, Velocity, Shape, Health, ChangeSet)
  },
  query: createQuery(Transform, Velocity, Shape, Health, ChangeSet),
}

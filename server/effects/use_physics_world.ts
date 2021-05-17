import {
  createEffect,
  createQuery,
  Entity,
  useMonitor,
  World,
} from "@javelin/ecs"
import { Clock } from "@javelin/hrtime-loop"
import { ChangeSet, set } from "@javelin/track"
import {
  Body,
  Box,
  Edge,
  Polygon,
  Shape as PlanckShape,
  Vec2,
  World as PlanckWorld,
} from "planck"
import { Shape, Transform, Velocity } from "../../common/schema"
import { TICK_RATE } from "../env"

const qryTransformWChanges = createQuery(Transform, ChangeSet)
const qryVelocity = createQuery(Velocity)

export const usePhysicsWorld = createEffect(({ tryGet }: World<unknown>) => {
  const world = new PlanckWorld(Vec2(0, -10))
  const bodies: Body[] = []
  const state = {
    impulse(entity: Entity, ix = 0, iy = 0, px = 0, py = 0, wake = false) {
      const body = bodies[entity]
      body.applyLinearImpulse(Vec2(ix, iy), Vec2(px, py), wake)
    },
  }
  var bar = world.createBody()
  bar.createFixture(Edge(Vec2(-20, 5), Vec2(20, 5) as any) as any)
  bar.setAngle(0.2)

  return function usePhysicsWorld() {
    useMonitor(
      qryTransformWChanges,
      (e, [{ x, y, angle }]) => {
        const body = world
          .createBody({
            angle,
            position: Vec2(x, y),
          })
          .setDynamic()
        // shapes
        const s = tryGet(e, Shape)
        if (s) {
          const shape = new Polygon(s.vertices.map(([x, y]) => Vec2(x, y)))
          body.createFixture({ shape: shape as unknown as PlanckShape })
        }
        // mass
        body.setMassData({
          mass: 1,
          center: Vec2(),
          I: 1,
        })
        bodies[e] = body
      },
      (e, [t]) => t && delete bodies[e],
    )
    useMonitor(qryVelocity, (e, [v]) => {
      const body = bodies[e]
      body.setLinearVelocity(Vec2(v.x, v.y))
    })
    qryVelocity((e, [{ x, y }]) => {
      const body = bodies[e]
      const velocity = body.getLinearVelocity()
      velocity.set(x, y)
    })
    for (const [entities, [transforms, changesets]] of qryTransformWChanges) {
      for (let i = 0; i < entities.length; i++) {
        const e = entities[i]
        const t = transforms[i]
        const c = changesets[i]
        const body = bodies[e]
        const { x, y } = body.getPosition()
        t.angle = body.getAngle()
        set(t, c, "x", x)
        set(t, c, "y", y)
      }
    }
    for (const [entities, [velocities]] of qryVelocity) {
      for (let i = 0; i < entities.length; i++) {
        const e = entities[i]
        const v = velocities[i]
        const { x, y } = bodies[e].getLinearVelocity()
        v.x = x
        v.y = y
      }
    }
    world.step(1 / TICK_RATE)
    return state
  }
})

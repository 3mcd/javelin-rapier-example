import { createEffect, observe, useMonitor, World } from "@javelin/ecs"
import { Velocity } from "../../../common"
import * as Rapier from "../../lib/rapier"
import { qryBodies, qryBoxes, qryDynamic } from "../queries"

const world = new Rapier.World(new Rapier.Vector2(0, -10))

world.createRigidBody(new Rapier.RigidBodyDesc(Rapier.BodyStatus.Dynamic))
world.step()

export const usePhysicsWorld = createEffect(({ has }: World<unknown>) => {
  const state = {}
  const rigidBodies: Rapier.RigidBody[] = []
  const gravity = new Rapier.Vector2(0, -10)
  const world = new Rapier.World(gravity)

  return function usePhysicsWorld() {
    useMonitor(
      qryBoxes,
      (e, [{ x, y, angle }, { width, height }]) => {
        const rigidBodyDesc = new Rapier.RigidBodyDesc(
          has(e, Velocity)
            ? Rapier.BodyStatus.Dynamic
            : Rapier.BodyStatus.Static,
        )
          .setTranslation(x, y)
          .setRotation(angle)
        const rigidBody = world.createRigidBody(rigidBodyDesc)
        const colliderDesc = Rapier.ColliderDesc.cuboid(width / 2, height / 2)
        world.createCollider(colliderDesc, rigidBody.handle)
        rigidBodies[e] = rigidBody
      },
      (e, [t]) => {
        // transform was removed
        if (t) {
          world.removeRigidBody(rigidBodies[e])
          delete rigidBodies[e]
        }
      },
    )
    for (const [entities, [transforms]] of qryBodies) {
      for (let i = 0; i < entities.length; i++) {
        const e = entities[i]
        const t = transforms[i]
        const o = observe(t)
        const rigidBody = rigidBodies[e]
        const { x, y } = rigidBody.translation()
        o.angle = rigidBody.rotation()
        o.x = x
        o.y = y
      }
    }
    for (const [entities, [velocities]] of qryDynamic) {
      for (let i = 0; i < entities.length; i++) {
        const e = entities[i]
        const v = velocities[i]
        const { x, y } = rigidBodies[e].linvel()
        v.x = x
        v.y = y
      }
    }
    world.step()
    return state
  }
})

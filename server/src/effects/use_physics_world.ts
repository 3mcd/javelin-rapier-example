import { createEffect, createQuery, useMonitor, World } from "@javelin/ecs"
import { ChangeSet, set } from "@javelin/track"
import { Shape, Transform, Velocity } from "../../../common"
import * as Rapier from "../../lib/rapier"

const qryTransformWChanges = createQuery(Transform, ChangeSet)
const qryVelocity = createQuery(Velocity)

const world = new Rapier.World(new Rapier.Vector2(0, -10))

world.createRigidBody(new Rapier.RigidBodyDesc(Rapier.BodyStatus.Dynamic))
world.step()

export const usePhysicsWorld = createEffect(({ tryGet }: World<unknown>) => {
  const state = {}
  const rigidBodies: Rapier.RigidBody[] = []
  const gravity = new Rapier.Vector2(0, -10)
  const world = new Rapier.World(gravity)

  // Create the ground
  const groundRigidBodyDesc = new Rapier.RigidBodyDesc(
    Rapier.BodyStatus.Static,
  ).setTranslation(0, -10)
  const groundRigidBody = world.createRigidBody(groundRigidBodyDesc)
  const groundColliderDesc = Rapier.ColliderDesc.cuboid(10.0, 0.1)
  world.createCollider(groundColliderDesc, groundRigidBody.handle)

  return function usePhysicsWorld() {
    useMonitor(
      qryTransformWChanges,
      (e, [{ x, y, angle }]) => {
        const rigidBodyDesc = new Rapier.RigidBodyDesc(
          Rapier.BodyStatus.Dynamic,
        )
          .setTranslation(x, y)
          .setRotation(angle)
        const rigidBody = world.createRigidBody(rigidBodyDesc)
        const colliderDesc = Rapier.ColliderDesc.cuboid(0.5, 0.5)
        const collider = world.createCollider(colliderDesc, rigidBody.handle)
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
    for (const [entities, [transforms, changesets]] of qryTransformWChanges) {
      for (let i = 0; i < entities.length; i++) {
        const e = entities[i]
        const t = transforms[i]
        const c = changesets[i]
        const rigidBody = rigidBodies[e]
        const { x, y } = rigidBody.translation()
        t.angle = rigidBody.rotation()
        set(t, c, "x", x)
        set(t, c, "y", y)
      }
    }
    for (const [entities, [velocities]] of qryVelocity) {
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
  // const world = new PlanckWorld(Vec2(0, -10))
  // const bodies: Body[] = []
  // const state = {
  //   impulse(entity: Entity, ix = 0, iy = 0, px = 0, py = 0, wake = false) {
  //     const body = bodies[entity]
  //     body.applyLinearImpulse(Vec2(ix, iy), Vec2(px, py), wake)
  //   },
  // }
})

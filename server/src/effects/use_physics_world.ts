import {
  component,
  createEffect,
  createQuery,
  useMonitor,
  World,
} from "@javelin/ecs"
import { ChangeSet, set } from "@javelin/track"
import { Box, Transform, Velocity } from "../../../common"
import * as Rapier from "../../lib/rapier"

const qryTransform = createQuery(Transform, Box)
const qryTransformWChanges = createQuery(Transform, ChangeSet)
const qryVelocity = createQuery(Velocity)

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
      qryTransform,
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
    for (const [entities, [transforms, changesets]] of qryTransformWChanges) {
      for (let i = 0; i < entities.length; i++) {
        const e = entities[i]
        const t = transforms[i]
        const c = changesets[i]
        const rigidBody = rigidBodies[e]
        const { x, y } = rigidBody.translation()
        set(t, c, "angle", rigidBody.rotation())
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
})

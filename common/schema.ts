import { arrayOf, registerSchema } from "@javelin/ecs"
import { float64, string, uint16 } from "@javelin/pack"

export const Player = {
  clientId: { ...string, length: 16 },
  name: { ...string, length: 35 },
}

export const Shape = {
  vertices: arrayOf(arrayOf(float64)),
}

export const Transform = {
  x: float64,
  y: float64,
  angle: float64,
}

export const Velocity = {
  x: float64,
  y: float64,
}

export const Health = {
  value: uint16,
}

registerSchema(Player, 1)
registerSchema(Shape, 2)
registerSchema(Transform, 3)
registerSchema(Velocity, 4)
registerSchema(Health, 5)

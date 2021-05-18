import { arrayOf, registerSchema } from "@javelin/ecs"
import { float64, number, string, uint16 } from "@javelin/pack"

export const Player = {
  clientId: { ...string, length: 16 },
  name: { ...string, length: 35 },
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

export const Box = {
  width: float64,
  height: float64,
}

registerSchema(Player, 1)
registerSchema(Box, 2)
registerSchema(Transform, 3)
registerSchema(Velocity, 4)
registerSchema(Health, 5)

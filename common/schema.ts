import { float64, string } from "@javelin/pack"

export const Player = {
  name: { ...string, length: 35 },
}

export const Rectangle = {
  width: float64,
  height: float64,
}

export const Transform = {
  x: float64,
  y: float64,
}

export const Velocity = {
  x: float64,
  y: float64,
}

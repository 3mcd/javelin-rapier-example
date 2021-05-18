import { createQuery } from "@javelin/ecs"
import { ChangeSet } from "@javelin/track"
import { Box, Player, Transform, Velocity } from "../../common/schema"

export const qryBodiesWChanges = createQuery(Transform, ChangeSet)
export const qryBoxes = createQuery(Transform, Box)
export const qryBoxesStatic = createQuery(Transform, Box).not(Velocity)
export const qryDynamic = createQuery(Velocity)
export const qryPlayers = createQuery(Player)

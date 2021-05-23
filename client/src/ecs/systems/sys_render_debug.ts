import { useInterval, useRef } from "@javelin/ecs"
import { CANVAS_SCALE, useConnect, useScene } from "../effects"

const REDRAW_BANDWIDTH_INTERVAL = 1000

export const sysRenderDebug = () => {
  const scene = useScene()
  const connect = useConnect()
  const bandwidth = useRef(0)
  const redrawBandwidth = useInterval(REDRAW_BANDWIDTH_INTERVAL)
  const context = scene.canvas?.context

  if (!context) {
    return
  }

  if (redrawBandwidth) {
    bandwidth.value = connect.bytes / (REDRAW_BANDWIDTH_INTERVAL / 1000)
    connect.bytes = 0
  }

  context.save()
  context.font = "16px SF Mono"
  context.fillStyle = "#137547"
  context.textAlign = "right"
  context.scale(1 / CANVAS_SCALE, -1 / CANVAS_SCALE)
  context.fillText(
    `${Number((bandwidth.value / 1000).toFixed(2)).toLocaleString()} kb/s`,
    (scene.canvas?.width ?? 0) - 18,
    32,
  )
  context.restore()
}

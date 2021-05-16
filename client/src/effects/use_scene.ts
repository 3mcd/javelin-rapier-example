export const useScene = () => {
  const start = () => {}
  const stop = () => {}
  const state = { start, stop }

  return function useScene() {
    return state
  }
}

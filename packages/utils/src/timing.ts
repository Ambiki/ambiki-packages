export function nextTick(): Promise<number> {
  return new Promise(requestAnimationFrame);
}

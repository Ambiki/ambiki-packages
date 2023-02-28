let globalId = 0;
/**
 * @description Returns a random string. If you want to use random values please consider the
 * Birthday Problem: https://en.wikipedia.org/wiki/Birthday_problem
 */
export default function randomId() {
  globalId += 1;
  return `ambiki-${Math.random().toString().slice(2, 6)}-${globalId}`;
}

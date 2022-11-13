// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends unknown[]>(callback: (...Rest: T) => unknown, wait = 0): (...Rest: T) => any {
  let timeout: number;

  return function (...Rest) {
    clearTimeout(timeout);

    timeout = window.setTimeout(() => {
      clearTimeout(timeout);
      callback(...Rest);
    }, wait);
  };
}

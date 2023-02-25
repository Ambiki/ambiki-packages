/**
 * @description Dispatches a `CustomEvent` with "auto-complete:" prefixed event name
 */
export function dispatchEvent(element: HTMLElement, name: string, options: CustomEventInit = {}) {
  return element.dispatchEvent(new CustomEvent(`auto-complete:${name}`, { bubbles: true, ...options }));
}

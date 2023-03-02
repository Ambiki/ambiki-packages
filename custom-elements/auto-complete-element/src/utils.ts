/**
 * @description Dispatches a `CustomEvent` with "auto-complete:" prefixed event name
 */
export function dispatchEvent<T>(element: HTMLElement, name: string, options: CustomEventInit<T> = {}): boolean {
  return element.dispatchEvent(new CustomEvent(`auto-complete:${name}`, { bubbles: true, ...options }));
}

/**
 * @description Returns the `value` attribute of the option element
 */
export function getValue(option: HTMLElement): string {
  return option.getAttribute('value') || '';
}

/**
 * @description Returns the label of the option element. It can either be `data-label` attribute or the `innerText`
 * of the option
 */
export function getLabel(option: HTMLElement): string {
  return option.getAttribute('data-label') || option.innerText.trim();
}

export type MakeAbortControllerType = AbortController | { signal: null; abort: () => void };
/**
 * @description Returns an instance of a `AbortController`
 */
export function makeAbortController(): MakeAbortControllerType {
  if ('AbortController' in window) {
    return new AbortController();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return { signal: null, abort() {} };
}

export type SetValueType = Array<{ value: string | number; label?: string }>;

/**
 * @description Transforms a given value to an array
 */
export function toArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) return value;
  return [value];
}

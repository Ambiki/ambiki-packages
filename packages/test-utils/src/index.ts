export function find<T extends HTMLElement>(selector: string): T {
  return document.querySelector(selector) as T;
}

export function findAll<T extends HTMLElement>(selector: string): T[] {
  return Array.from(document.querySelectorAll(selector)) as T[];
}

export function fillIn<T extends HTMLInputElement>(input: T, value = '', options: EventInit = {}): Promise<T> {
  return new Promise((resolve) => {
    input.value = value;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, ...options }));
    resolve(input);
  });
}

export function triggerEvent<T extends Element>(element: T, name: string, options: CustomEventInit = {}): Promise<T> {
  return new Promise((resolve) => {
    element.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable: true, ...options }));
    resolve(element);
  });
}

export function triggerKeyEvent<T extends HTMLElement>(
  element: T,
  type: string,
  options: KeyboardEventInit = {}
): Promise<T> {
  return new Promise((resolve) => {
    element.dispatchEvent(new KeyboardEvent(type, { bubbles: true, cancelable: true, ...options }));
    resolve(element);
  });
}

export function triggerMouseover<T extends Element>(element: T): Promise<T> {
  return new Promise((resolve) => {
    triggerEvent(element, 'mousemove');
    triggerEvent(element, 'mouseover');
    resolve(element);
  });
}

export type MoveDirection = 1 | -1;

/**
 * @description Cycle through an array of elements. Returns the next/prev element from the array.
 */
export function move(elements: HTMLElement[], activeElement: HTMLElement, index: MoveDirection): HTMLElement {
  let activeIndex = elements.indexOf(activeElement);

  if (activeIndex === elements.length - 1 && index === 1) {
    activeIndex = -1;
  }

  let indexOfElement = index === 1 ? 0 : elements.length - 1;
  if (activeElement && activeIndex >= 0) {
    const newIndex = activeIndex + index;
    if (newIndex >= 0 && newIndex < elements.length) {
      indexOfElement = newIndex;
    }
  }

  return elements[indexOfElement];
}

/**
 * @description Check if an element has `disabled` or `aria-selected="true"` attribute.
 */
export function enabled(element: HTMLElement) {
  return !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true';
}

export type Boundary = HTMLElement | null;
export type BoundaryCollection = Boundary[];

/**
 * @description Trigger a callback when clicked outside of element(s).
 * @see {@link https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-react/src/hooks/use-outside-click.ts}
 */
export function outsideClick<E extends MouseEvent | PointerEvent | Event>(
  event: E,
  resolveTarget: (event: E) => HTMLElement | null,
  boundaries: Boundary | Boundary[],
  callback: (event: E, target: HTMLElement) => void
) {
  if (event.defaultPrevented) return;

  const _boundaries = (function resolve(boundaries) {
    if (Array.isArray(boundaries)) return boundaries;

    return [boundaries];
  })(boundaries);

  const target = resolveTarget(event);
  if (!target) return;

  if (!target.getRootNode().contains(target)) return;

  for (const boundary of _boundaries) {
    if (boundary === null) continue;
    if (boundary.contains(target)) return;
    if (event.composed && event.composedPath().includes(boundary)) return;
  }

  return callback(event, target);
}

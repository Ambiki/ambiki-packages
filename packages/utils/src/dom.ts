export type MoveDirection = 1 | -1;

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

export type Container = HTMLElement | null;
export type ContainerInput = Container | Container[];

export function handleOutsideClick<T extends MouseEvent | PointerEvent | FocusEvent>(
  event: T,
  resolveTarget: (event: T) => HTMLElement | null,
  containers: ContainerInput | (() => ContainerInput),
  callback: (event: MouseEvent | PointerEvent | FocusEvent, target: HTMLElement) => void
) {
  if (event.defaultPrevented) return;

  const target = resolveTarget(event);
  if (!target) return;
  // Ignore if the target doesn't exist in the DOM anymore
  if (!target.getRootNode().contains(target)) return;

  const _containers = (function resolve(containers): Container[] {
    if (typeof containers === 'function') {
      return resolve(containers());
    }

    if (Array.isArray(containers)) return containers;
    return [containers];
  })(containers);

  for (const container of _containers) {
    if (!container) continue;
    if (container.contains(target)) return;
  }

  return callback(event, target);
}

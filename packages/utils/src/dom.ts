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

import { brandedId } from '@ambiki/utils/src/random-id';
import { move, MoveDirection, enabled } from '@ambiki/utils';

const ctrlBindings = !!navigator.userAgent.match(/Macintosh/);

export interface Options {
  multiple?: boolean;
}

export default class Combobox {
  input: HTMLInputElement;
  list: HTMLElement;
  multiple: boolean;
  private isMouseMoving = false;

  constructor(input: HTMLInputElement, list: HTMLElement, { multiple = false }: Options = {}) {
    this.input = input;
    this.list = list;
    this.multiple = multiple;

    // Set `id` if it's missing
    if (!this.list.id) this.list.id = brandedId();

    // Set a11y attributes
    if (!this.input.getAttribute('aria-expanded')) {
      this.input.setAttribute('aria-expanded', 'false');
    }
    if (this.multiple) {
      this.input.setAttribute('aria-multiselectable', 'true');
    }
    this.input.setAttribute('role', 'combobox');
    this.input.setAttribute('aria-haspopup', 'listbox');
    this.input.setAttribute('aria-autocomplete', 'list');
    this.list.setAttribute('role', 'listbox');

    this.onKeydown = this.onKeydown.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onListMouseover = this.onListMouseover.bind(this);
    this.onListMousemove = this.onListMousemove.bind(this);
  }

  /**
   * @description Sets up event listeners and attributes on the elements
   */
  start() {
    this.isMouseMoving = false;
    this.input.setAttribute('aria-expanded', 'true');
    this.input.setAttribute('aria-controls', this.list.id);

    this.input.addEventListener('keydown', this.onKeydown);
    this.list.addEventListener('click', this.onClick);
    this.list.addEventListener('mouseover', this.onListMouseover);
    this.list.addEventListener('mousemove', this.onListMousemove);
    this.initializeOptions();
  }

  /**
   * @description Removes the event listeners and attributes from the elements
   */
  stop() {
    this.isMouseMoving = false;
    this.input.setAttribute('aria-expanded', 'false');
    this.input.removeAttribute('aria-controls');

    this.input.removeEventListener('keydown', this.onKeydown);
    this.list.removeEventListener('click', this.onClick);
    this.list.removeEventListener('mouseover', this.onListMouseover);
    this.list.removeEventListener('mousemove', this.onListMousemove);
    this.deselectAll();
    this.deactivate();
  }

  private onKeydown(event: KeyboardEvent) {
    this.isMouseMoving = false;
    if (event.shiftKey || event.metaKey || event.altKey) return;
    if (!ctrlBindings && event.ctrlKey) return;

    switch (event.key) {
      case 'Enter':
      case 'Tab':
        if (!this.activeOption) break;
        if (!enabled(this.activeOption)) break;
        event.preventDefault();
        event.stopPropagation();
        this.activeOption.click();
        break;
      case 'Escape':
        this.deactivate();
        break;
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        if (this.activeOption) {
          this.move(1);
        } else {
          this.activate(this.visibleOptions[0], { scroll: true });
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        if (this.activeOption) {
          this.move(-1);
        } else {
          this.activate(this.visibleOptions[this.visibleOptions.length - 1], { scroll: true });
        }
        break;
      case 'Home':
        event.preventDefault();
        event.stopPropagation();
        this.activate(this.visibleOptions[0], { scroll: true });
        break;
      case 'End':
        event.preventDefault();
        event.stopPropagation();
        this.activate(this.visibleOptions[this.visibleOptions.length - 1], { scroll: true });
        break;
      default:
        if (event.ctrlKey) break;
        this.deactivate();
    }
  }

  private onClick(event: Event) {
    const option = getClosestOptionFrom(event.target as HTMLElement);
    if (!option || !enabled(option)) return;

    if (this.multiple) {
      this.isSelected(option) ? this.deselect(option) : this.select(option);
    } else {
      this.select(option);
    }

    option.dispatchEvent(new CustomEvent('combobox:commit', { bubbles: true }));
  }

  private onListMouseover(event: Event) {
    if (!this.isMouseMoving) {
      event.preventDefault();
      return;
    }

    const option = getClosestOptionFrom(event.target as HTMLElement);
    if (!option) return;
    this.activate(option);
  }

  private onListMousemove(event: Event) {
    if (this.isMouseMoving) return;

    this.isMouseMoving = true;
    const option = getClosestOptionFrom(event.target as HTMLElement);
    if (!option) return;
    this.activate(option);
  }

  /**
   * @description Sets `aria-selected="true"` on the option element. If it's a single select, then it deselects all
   * the options and selects only the provided option
   */
  select(option: HTMLElement) {
    if (this.multiple) {
      option.setAttribute('aria-selected', 'true');
      return;
    }

    for (const el of this.options) {
      el.setAttribute('aria-selected', (el === option).toString());
    }
  }

  /**
   * @description Sets `aria-selected="false"` on the option element
   */
  deselect(option: HTMLElement) {
    option.setAttribute('aria-selected', 'false');
  }

  /**
   * @description Sets `aria-selected="false"` on all the option elements
   */
  deselectAll() {
    for (const option of this.options) {
      this.deselect(option);
    }
  }

  /**
   * @description Sets `data-active` attribute on the option element. It also sets `aria-activedescendant` as the
   * `id` of the option on the input field
   */
  activate(option: HTMLElement, { scroll = false } = {}) {
    for (const el of this.options) {
      if (el.id === option.id) {
        el.setAttribute('data-active', '');
        this.input.setAttribute('aria-activedescendant', el.id);
        if (scroll) el.scrollIntoView({ block: 'nearest' });
      } else {
        el.removeAttribute('data-active');
      }
    }
  }

  /**
   * @description Removes `data-active` and `aria-activedescendant` attribute from the option and input field
   * respectively
   */
  deactivate() {
    this.input.removeAttribute('aria-activedescendant');
    for (const option of Array.from(this.list.querySelectorAll<HTMLElement>('[role="option"][data-active]'))) {
      option.removeAttribute('data-active');
    }
  }

  /**
   * @description Returns `true` if the option has `aria-selected="true"`, `false` otherwise
   */
  isSelected(option: HTMLElement) {
    return option.getAttribute('aria-selected') === 'true';
  }

  /**
   * @description Returns all the option elements within the list
   */
  get options() {
    return Array.from(this.list.querySelectorAll<HTMLElement>('[role="option"]'));
  }

  private get visibleOptions() {
    return this.options.filter(visible);
  }

  /**
   * @description Returns the option element that has the `data-active` attribute
   */
  get activeOption() {
    return this.list.querySelector<HTMLElement>('[data-active]');
  }

  private move(index: MoveDirection) {
    if (!this.activeOption) return;
    const option = move(this.visibleOptions, this.activeOption, index);
    this.activate(option, { scroll: true });
  }

  /**
   * @description Set initial attributes on options
   */
  initializeOptions() {
    for (const option of this.options) {
      option.setAttribute('tabindex', '-1');
      if (!option.id) option.id = brandedId();
      if (!option.hasAttribute('aria-selected')) this.deselect(option);
    }
  }
}

function getClosestOptionFrom(target: HTMLElement | null) {
  if (!(target instanceof HTMLElement)) return false;

  const option = target.closest<HTMLElement>('[role="option"]');
  if (!(option instanceof HTMLElement)) return false;

  return option;
}

function visible(option: HTMLElement) {
  return (
    !option.hidden &&
    !(option instanceof HTMLInputElement && option.type === 'hidden') &&
    (option.offsetWidth > 0 || option.offsetHeight > 0)
  );
}

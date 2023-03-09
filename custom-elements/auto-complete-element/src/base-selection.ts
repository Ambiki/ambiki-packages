import type AutoCompleteElement from './element';
import type AutoComplete from './auto-complete';
import { getLabel, getValue } from './utils';

export default class BaseSelection {
  protected container: AutoCompleteElement;
  protected autocomplete: AutoComplete;
  protected input: HTMLInputElement;

  constructor(container: AutoCompleteElement, autocomplete: AutoComplete, input: HTMLInputElement) {
    this.container = container;
    this.autocomplete = autocomplete;
    this.input = input;
  }

  /**
   * @description Fired when `auto-complete` is initialized. Any setup must be done here.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initialize() {}

  /**
   * @description Fired before `auto-complete` is destroyed. Any clean up required must be done here.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy() {}

  /**
   * @description Fired before list is shown.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  connect() {}

  /**
   * @description Fired before list is hidden.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() {}

  /**
   * @description Get `value` attribute.
   */
  protected getValue(option: HTMLElement): string {
    return getValue(option);
  }

  /**
   * @description Get `data-label` attribute.
   */
  protected getLabel(option: HTMLElement): string {
    return getLabel(option);
  }

  /**
   * @description Appends hidden field into the body `auto-complete` element.
   */
  protected insertHiddenField({ value, variant = 'base' }: { value: string; variant?: 'base' | 'item' }) {
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = this.container.name;
    hiddenField.value = value;
    hiddenField.dataset.variant = variant;
    this.container.append(hiddenField);
  }
}

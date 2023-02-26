import type AutoCompleteElement from './index';
import type AutoComplete from './auto_complete';
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
   * @description Fired when `auto-complete` is initialized
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initialize() {}

  /**
   * @description Fired before `auto-complete` is destroyed
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy() {}

  /**
   * @description Fired before list is shown
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  connect() {}

  /**
   * @description Fired before list is hidden
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() {}

  /**
   * @description Get `value` attribute
   */
  protected getValue(option: HTMLElement): string {
    return getValue(option);
  }

  /**
   * @description Get `data-label` attribute
   */
  protected getLabel(option: HTMLElement): string {
    return getLabel(option);
  }
}

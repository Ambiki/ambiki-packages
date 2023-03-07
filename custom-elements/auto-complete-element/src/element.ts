import AutoComplete from './auto-complete';

export default class AutoCompleteElement extends HTMLElement {
  /**
   * @description Handles all the core logic of the component. To access functions see the example below:
   * @example
   * <auto-complete>
   *   <!-- More -->
   * </auto-complete>
   *
   * const element = document.querySelector('auto-complete');
   * const options = element.autocomplete.options;
   * element.autocomplete.setValue([{ value: 1 }]);
   * // etc
   */
  autocomplete?: AutoComplete;

  connectedCallback() {
    const input = this.querySelector<HTMLInputElement>('input:not([type="hidden"])');
    const id = this.getAttribute('for');
    if (!id) return;

    const list = document.getElementById(id);
    if (!(input instanceof HTMLElement) || !list) return;

    this.autocomplete = new AutoComplete(this, input, list);
  }

  static get observedAttributes(): string[] {
    return ['open'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    if (!this.autocomplete) return;

    switch (name) {
      case 'open':
        newValue === null ? this.autocomplete.hideList() : this.autocomplete.showList();
        break;
    }
  }

  disconnectedCallback() {
    this.autocomplete?.destroy();
  }

  /**
   * @description Returns the `name` attribute of the `auto-complete` element.
   */
  get name(): string {
    return this.getAttribute('name') || '';
  }

  /**
   * @description Sets the `name` attribute of the `auto-complete` element.
   */
  set name(value: string) {
    this.setAttribute('name', value);
  }

  /**
   * @description Selected option's value
   */
  get value(): string {
    return this.getAttribute('value') || '';
  }

  /**
   * @description Sets the value of the `auto-complete` element with the selected option's value
   */
  set value(value: string | null | undefined) {
    if (!value || value === '[]') {
      this.removeAttribute('value');
      return;
    }
    this.setAttribute('value', value);
  }

  /**
   * @description Selected option's label or `innerText`
   */
  get label(): string {
    return this.getAttribute('data-label') || '';
  }

  /**
   * @description Sets the label of the `auto-complete` element with the selected option's label or `innerText`
   */
  set label(value: string) {
    if (!value) {
      this.removeAttribute('data-label');
      return;
    }
    this.setAttribute('data-label', value);
  }

  /**
   * @description Whether the list is open or not
   */
  get open(): boolean {
    return this.hasAttribute('open');
  }

  /**
   * @description Shows/hides the list
   */
  set open(value: boolean) {
    if (value) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
    }
  }

  /**
   * @description Whether multiple options can be selected or not
   */
  get multiple(): boolean {
    return this.hasAttribute('multiple');
  }

  /**
   * @description Updates the multiple state
   */
  set multiple(value: boolean) {
    if (value) {
      this.setAttribute('multiple', '');
    } else {
      this.removeAttribute('multiple');
    }
  }

  /**
   * @description Returns the `src` attribute of the element
   */
  get src(): string {
    return this.getAttribute('src') || '';
  }

  /**
   * @description Sets the `src` attribute of the element
   */
  set src(value: string) {
    this.setAttribute('src', value);
  }

  /**
   * @description Returns the query param name
   */
  get param(): string {
    return this.getAttribute('param') || 'q';
  }

  /**
   * @description Sets the `param` attribute of the element
   */
  set param(value: string) {
    this.setAttribute('param', value);
  }
}

declare global {
  interface Window {
    AutoCompleteElement: typeof AutoCompleteElement;
  }
  interface HTMLElementTagNameMap {
    'auto-complete': AutoCompleteElement;
  }
}

if (!window.customElements.get('auto-complete')) {
  window.AutoCompleteElement = AutoCompleteElement;
  window.customElements.define('auto-complete', AutoCompleteElement);
}

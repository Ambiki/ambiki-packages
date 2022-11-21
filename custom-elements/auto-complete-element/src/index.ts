import { MAX_SAFE_INTEGER } from '@ambiki/utils';
import Autocomplete from './autocomplete';

export type SelectedOption = {
  id: string;
  value: string;
};

export type ParsedValue = SelectedOption | SelectedOption[] | null;

export default class AutoCompleteElement extends HTMLElement {
  autocomplete: Autocomplete | null = null;

  connectedCallback(): void {
    const input = this.querySelector<HTMLInputElement>('input:not([type="hidden"])');
    const id = this.getAttribute('for');
    if (!id) return;

    const list = document.getElementById(id);
    if (!(input instanceof HTMLElement) || !list) return;

    this.autocomplete = new Autocomplete(this, input, list);
  }

  disconnectedCallback(): void {
    this.autocomplete?.destroy();
  }

  static get observedAttributes(): string[] {
    return ['value'];
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string): void {
    if (oldValue === newValue) return;

    if (this.autocomplete) {
      this.autocomplete.value = getParsedValue(newValue);
    }
  }

  get multiple(): boolean {
    return this.hasAttribute('multiple');
  }

  set multiple(value: boolean) {
    if (value) {
      this.setAttribute('multiple', '');
    } else {
      this.removeAttribute('multiple');
    }
  }

  get max(): number {
    if (this.hasAttribute('max') && !Number.isNaN(this.getAttribute('max'))) {
      return Number(this.getAttribute('max'));
    }

    return MAX_SAFE_INTEGER;
  }

  set max(value: number) {
    this.setAttribute('max', value.toString());
  }

  get src(): string {
    return this.getAttribute('src') || '';
  }

  set src(value: string) {
    this.setAttribute('src', value);
  }

  get value(): SelectedOption | SelectedOption[] {
    const value = this.getAttribute('value') || '';
    if (this.multiple) return getParsedValue(value);
    return getParsedValue(value)[0] ? getParsedValue(value)[0] : <SelectedOption>{};
  }

  set value(value: SelectedOption | SelectedOption[]) {
    const _value = JSON.stringify(value);

    if (typeof _value === 'undefined' || _value === '[]' || !_value) {
      this.removeAttribute('value');
    } else {
      this.setAttribute('value', _value);
    }
  }

  get param(): string {
    return this.getAttribute('param') || 'q';
  }

  set param(value: string) {
    this.setAttribute('param', value);
  }
}

function getParsedValue(value: string): SelectedOption[] {
  try {
    const parsedValue = JSON.parse(value) as ParsedValue;
    if (!parsedValue) throw new Error();
    // Since an element's id is of type string, we'll need to convert the user passed value's id into a string as well.
    // This will allow us to use `===`
    if (Array.isArray(parsedValue)) {
      return parsedValue.map((v) => ({ ...v, id: v.id.toString() }));
    }

    return [{ ...parsedValue, id: parsedValue.id.toString() }];
  } catch {
    return [];
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

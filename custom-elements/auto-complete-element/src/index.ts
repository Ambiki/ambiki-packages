import { MAX_SAFE_INTEGER } from '@ambiki/utils';
import Autocomplete from './autocomplete';

export default class AutoCompleteElement extends HTMLElement {
  autocomplete: Autocomplete | null = null;

  connectedCallback() {
    const input = this.querySelector<HTMLInputElement>('input:not([type="hidden"])');
    const id = this.getAttribute('for');
    if (!id) return;

    const list = document.getElementById(id);
    if (!(input instanceof HTMLElement) || !list) return;

    this.autocomplete = new Autocomplete(this, input, list);
  }

  disconnectedCallback() {
    this.autocomplete?.destroy();
  }

  get multiple() {
    return this.hasAttribute('multiple');
  }

  get max() {
    if (this.hasAttribute('max') && !Number.isNaN(this.getAttribute('max'))) {
      return Number(this.getAttribute('max'));
    }

    return MAX_SAFE_INTEGER;
  }

  set max(value: number) {
    this.setAttribute('max', value.toString());
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

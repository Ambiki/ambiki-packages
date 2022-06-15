import Autocomplete from './autocomplete';

export default class AutoCompleteElement extends HTMLElement {
  autocomplete: Autocomplete | null = null;

  connectedCallback() {
    const input = this.querySelector('input');
    const id = this.getAttribute('for');
    if (!id) return;

    const list = document.getElementById(id);
    if (!(input instanceof HTMLElement) || !list) return;

    this.autocomplete = new Autocomplete(this, input, list);
  }

  disconnectedCallback() {
    this.autocomplete?.destroy();
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

import { copyText, copyNode } from './clipboard';

export default class ClippyCopyElement extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'button');
    }

    this.onClick = this.onClick.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.addEventListener('click', this.onClick);
    this.addEventListener('focus', this.onFocus);
    this.addEventListener('blur', this.onBlur);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('focus', this.onFocus);
    this.removeEventListener('blur', this.onBlur);
  }

  onClick(event: Event) {
    const button = event.currentTarget;
    if (!(button instanceof HTMLElement)) return;

    copy(button);
  }

  onFocus(event: Event) {
    const button = event.currentTarget as HTMLElement;
    button.addEventListener('keydown', onKeydown);
  }

  onBlur(event: Event) {
    const button = event.currentTarget as HTMLElement;
    button.removeEventListener('keydown', onKeydown);
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === ' ' || event.key === 'Enter') {
    const button = event.currentTarget;
    if (!(button instanceof HTMLElement)) return;

    event.preventDefault();
    copy(button);
  }
}

async function copy(button: HTMLElement) {
  const value = button.getAttribute('value');
  const id = button.getAttribute('for');

  if (value) {
    await copyText(value);
    dispatchEvent(button);
  } else if (id) {
    const target = document.getElementById(id);
    if (!(target instanceof HTMLElement)) return;

    await copyNode(target);
    dispatchEvent(button);
  }
}

function dispatchEvent(element: HTMLElement) {
  element.dispatchEvent(new CustomEvent('clippy-copy:copied', { bubbles: true }));
}

declare global {
  interface Window {
    ClippyCopyElement: typeof ClippyCopyElement;
  }
  interface HTMLElementTagNameMap {
    'clippy-copy': ClippyCopyElement;
  }
}

if (!window.customElements.get('clippy-copy')) {
  window.ClippyCopyElement = ClippyCopyElement;
  window.customElements.define('clippy-copy', ClippyCopyElement);
}

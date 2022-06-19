import { FocusableElement, isTabbable, tabbable } from 'tabbable';

export default class DetailsModalElement extends HTMLElement {
  details: HTMLDetailsElement | null = null;

  connectedCallback() {
    this.details = this.parentElement as HTMLDetailsElement;
    if (!this.details) return;

    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'true');

    const summary = this.details.querySelector('summary');
    if (summary) {
      if (!summary.hasAttribute('role')) summary.setAttribute('role', 'button');
    }

    this.details.addEventListener('toggle', onToggle);
    this.details.addEventListener('keydown', onKeydown);
    this.details.addEventListener('click', onClick);
  }

  disconnectedCallback() {
    if (this.details) {
      this.details.removeEventListener('toggle', onToggle);
      this.details.removeEventListener('keydown', onKeydown);
      this.details.removeEventListener('click', onClick);
    }
  }
}

function onToggle(event: Event) {
  const details = event.currentTarget as HTMLDetailsElement;

  if (details.open) {
    open(details);
  } else {
    close(details);
  }
}

function onKeydown(event: KeyboardEvent) {
  const details = event.currentTarget as HTMLDetailsElement;
  if (event.key === 'Escape') {
    close(details);
    event.preventDefault();
    event.stopPropagation();
  }
}

function onClick(event: Event) {
  const { target } = event;
  if (!(target instanceof HTMLElement)) return;

  const details = target.closest('details');
  if (!details) return;
  if (target.closest('[data-modal-close]')) {
    close(details);
  }
}

function interceptTabbing(event: KeyboardEvent) {
  if (event.key !== 'Tab') return;
  const { currentTarget: modal } = event;
  if (!(modal instanceof DetailsModalElement)) return;

  event.preventDefault(); // Trap focus from this point onwards

  const focusableElements = Array.from(tabbable(modal));
  if (focusableElements.length === 0) return;

  const movement = event.shiftKey ? -1 : 1;
  const activeElement = modal.contains(document.activeElement) ? document.activeElement : null;
  if (!(activeElement instanceof HTMLElement)) return;

  const activeIndex = focusableElements.indexOf(activeElement);
  const nextActiveElement = wrap(focusableElements, activeIndex + movement);

  if (nextActiveElement !== document.activeElement) {
    nextActiveElement.focus();
  }
}

function open(details: HTMLDetailsElement) {
  const modal = details.querySelector('details-modal');
  if (modal) {
    modal.addEventListener('keydown', interceptTabbing);
    modal.addEventListener('submit', checkFormSubmission);
    focusFirstElement(modal);
  }
}

function close(details: HTMLDetailsElement) {
  details.removeAttribute('open');
  const modal = details.querySelector('details-modal');
  if (modal) {
    modal.removeEventListener('keydown', interceptTabbing);
    modal.removeEventListener('submit', checkFormSubmission);
    modal.removeAttribute('tabindex');
  }

  const summary = details.querySelector('summary');
  if (summary && summary.getAttribute('role') !== 'none') {
    summary.focus();
  }
}

function checkFormSubmission(event: Event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  if (form.getAttribute('method') === 'dialog') {
    event.preventDefault();

    const details = form.closest('details');
    if (details) close(details);
  }
}

function focusFirstElement(modal: DetailsModalElement) {
  const autofocus = modal.querySelector<HTMLElement>('[autofocus]');
  const firstFocusableElement = [autofocus, ...tabbable(modal)].filter(Boolean)[0];

  if (firstFocusableElement instanceof HTMLElement && isTabbable(firstFocusableElement)) {
    firstFocusableElement.focus();
  } else {
    modal.setAttribute('tabindex', '-1');
    modal.focus();
  }
}

function wrap(array: FocusableElement[], currentActiveIndex: number) {
  const indexOfFirstElement = 0;
  const indexOfLastElement = array.length - 1;

  if (currentActiveIndex < indexOfFirstElement) return array[indexOfLastElement];
  if (currentActiveIndex > indexOfLastElement) return array[indexOfFirstElement];
  return array[currentActiveIndex];
}

declare global {
  interface Window {
    DetailsModalElement: typeof DetailsModalElement;
  }
  interface HTMLElementTagNameMap {
    'details-modal': DetailsModalElement;
  }
}

if (!window.customElements.get('details-modal')) {
  window.DetailsModalElement = DetailsModalElement;
  window.customElements.define('details-modal', DetailsModalElement);
}

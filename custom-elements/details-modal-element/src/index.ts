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
  const modal = event.currentTarget as DetailsModalElement;

  event.preventDefault();

  const focusableElements = Array.from(modal.querySelectorAll<HTMLElement>('*')).filter(focusable);
  if (focusableElements.length === 0) return;

  const movement = event.shiftKey ? -1 : 1;
  const currentFocus = modal.contains(document.activeElement) ? document.activeElement : null;
  let targetIndex = movement === -1 ? -1 : 0;

  if (currentFocus instanceof HTMLElement) {
    const currentIndex = focusableElements.indexOf(currentFocus);
    if (currentIndex !== -1) {
      targetIndex = currentIndex + movement;
    }
  }

  if (targetIndex < 0) {
    targetIndex = focusableElements.length - 1;
  } else {
    targetIndex %= focusableElements.length;
  }

  focusableElements[targetIndex].focus();
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
  const autofocusable = Array.from(modal.querySelectorAll<HTMLElement>('[autofocus]')).filter(focusable)[0] as
    | HTMLElement
    | undefined;
  if (autofocusable) {
    autofocusable.focus();
  } else {
    modal.setAttribute('tabindex', '-1');
    modal.focus();
  }
}

function focusable(element: HTMLElement) {
  return element.tabIndex >= 0 && !element.hasAttribute('disabled') && visible(element);
}

function visible(element: HTMLElement) {
  return (
    !element.hidden &&
    element.getAttribute('type') !== 'hidden' &&
    (element.offsetWidth > 0 || element.offsetHeight > 0)
  );
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

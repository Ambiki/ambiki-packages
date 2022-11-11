import type AutoCompleteElement from './index';
import Combobox from '@ambiki/combobox';
import { debounce, nextTick } from '@ambiki/utils';

const AUTOCOMPLETE_VALUE_ATTR = 'data-autocomplete-value';
const DATA_EMPTY_ATTR = 'data-empty';

export default class Autocomplete {
  element: AutoCompleteElement;
  input: HTMLInputElement;
  list: HTMLElement;
  resetButton: HTMLElement | null;
  isMultiple: boolean;
  combobox: Combobox;
  listObserver: MutationObserver;

  constructor(element: AutoCompleteElement, input: HTMLInputElement, list: HTMLElement) {
    this.element = element;
    this.input = input;
    this.list = list;

    this.list.hidden = true;
    this.isMultiple = this.element.hasAttribute('multiple');
    this.combobox = new Combobox(this.input, this.list, { isMultiple: this.isMultiple });

    this.input.setAttribute('spellcheck', 'false');
    this.input.setAttribute('autocomplete', 'off');
    this.list.setAttribute('tabindex', '-1');

    // Reset button
    this.resetButton = this.element.querySelector('[data-autocomplete-reset]');
    if (this.resetButton && !this.resetButton.hasAttribute('aria-label')) {
      this.resetButton.setAttribute('aria-label', 'reset autocomplete');
    }

    this.onFocus = this.onFocus.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onCommit = this.onCommit.bind(this);
    this.onInput = debounce(this.onInput.bind(this), 300);
    this.onBlur = this.onBlur.bind(this);
    this.handleReset = this.handleReset.bind(this);

    this.input.addEventListener('focus', this.onFocus);
    this.input.addEventListener('blur', this.onBlur);
    this.input.addEventListener('pointerdown', this.onPointerDown); // We use `pointerdown` instead of `click` to simulate the `focus` event
    this.input.addEventListener('keydown', this.onKeydown);
    this.input.addEventListener('input', this.onInput);
    this.list.addEventListener('combobox:commit', this.onCommit);
    this.resetButton?.addEventListener('click', this.handleReset);

    this.listObserver = new MutationObserver(this.onListToggle.bind(this));
    this.listObserver.observe(this.list, { attributes: true, attributeFilter: ['hidden'] });
  }

  destroy() {
    this.input.removeEventListener('focus', this.onFocus);
    this.input.removeEventListener('blur', this.onBlur);
    this.input.removeEventListener('pointerdown', this.onPointerDown);
    this.input.removeEventListener('keydown', this.onKeydown);
    this.input.removeEventListener('input', this.onInput);
    this.list.removeEventListener('combobox:commit', this.onCommit);
    this.resetButton?.removeEventListener('click', this.handleReset);

    this.listObserver.disconnect();
  }

  onListToggle() {
    if (this.list.hidden) {
      dispatchEvent(this.element, 'hide');
      this.combobox.stop();
      this.list.removeAttribute(DATA_EMPTY_ATTR);
      syncSelection(this);
      dispatchEvent(this.element, 'hidden');
    } else {
      dispatchEvent(this.element, 'show');
      this.combobox.start();
      this.list.toggleAttribute(DATA_EMPTY_ATTR, this.combobox.visibleOptions.length === 0);
      dispatchEvent(this.element, 'shown');
    }
  }

  onFocus() {
    if (!this.list.hidden) return;

    this.openAndInitializeList();
  }

  onPointerDown() {
    if (!this.list.hidden) return;
    if (document.activeElement !== this.input) return; // If it's not already active, then `onFocus` logic will apply

    this.openAndInitializeList();
  }

  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        if (!this.list.hidden) {
          this.list.hidden = true;
          event.preventDefault();
          event.stopPropagation();
        }
        break;
      case 'ArrowDown':
        if (event.altKey && this.list.hidden) {
          this.openAndInitializeList();
          event.preventDefault();
          event.stopPropagation();
        }
        break;
      case 'ArrowUp':
        if (event.altKey && !this.list.hidden) {
          this.list.hidden = true;
          event.preventDefault();
          event.stopPropagation();
        }
        break;
      default:
        break;
    }
  }

  onInput() {
    if (this.list.hidden) {
      this.list.hidden = false;
    }

    const query = this.input.value.trim();
    this.filterListWithQuery(query);
    this.combobox.setActive(this.combobox.visibleOptions[0]);
    this.list.toggleAttribute(DATA_EMPTY_ATTR, this.combobox.visibleOptions.length === 0);
  }

  onCommit(event: Event) {
    const option = event.target;
    if (!(option instanceof HTMLElement)) return;

    const value = (option.getAttribute(AUTOCOMPLETE_VALUE_ATTR) || option.textContent) as string;
    if (this.isMultiple) {
      if (this.input.value) {
        this.inputValue = '';
        this.filterListWithQuery();
        this.combobox.setActive(option);
      }
    } else {
      this.inputValue = value;
      this.list.hidden = true;
    }

    dispatchEvent(this.element, 'selected', { detail: { relatedTarget: option } });
  }

  async onBlur(event: FocusEvent) {
    const { relatedTarget } = event;
    if (!(relatedTarget instanceof HTMLElement)) {
      this.list.hidden = true;
      return;
    }

    const list = relatedTarget.closest<HTMLElement>('[role="listbox"]');
    if (list) {
      await nextTick(); // Wait for nextTick before focusing (Firefox edge case)
      this.input.focus(); // Always keep focus on the input field when interacting with the list
    } else {
      this.list.hidden = true; // Hide the list for other elements that triggered the blur
    }
  }

  async handleReset(event: Event) {
    event.preventDefault();

    for (const option of this.combobox.options.filter(selected)) {
      option.setAttribute('aria-selected', 'false');
    }
    syncSelection(this);
    this.input.focus();

    await nextTick();
    if (!this.list.hidden) {
      this.list.hidden = true;
    }

    // Should fire after closing the list
    dispatchEvent(this.element, 'reset');
  }

  openAndInitializeList() {
    this.list.hidden = false;
    this.filterListWithQuery();
    this.activateFirstOption();
  }

  filterListWithQuery(query = '') {
    this.combobox.options.forEach(filterOptions(query, { matching: AUTOCOMPLETE_VALUE_ATTR }));
  }

  async activateFirstOption() {
    const selectedOption = this.combobox.options.filter(selected)[0];
    const firstOption = selectedOption || this.combobox.visibleOptions[0];
    await nextTick(); // `aria-activedescendant` on input field isn't always set, so we need to wait for the next tick
    this.combobox.setActive(firstOption);
  }

  set inputValue(value: string) {
    this.input.value = value;
    this.input.dispatchEvent(new Event('change'));
  }
}

function filterOptions(query: string, { matching }: { matching: string }) {
  return (target: HTMLElement) => {
    if (query) {
      const value = target.getAttribute(matching) || target.textContent;
      const match = value?.toLowerCase().includes(query.toLowerCase());
      target.hidden = !match;
    } else {
      target.hidden = false;
    }
  };
}

function syncSelection(autocomplete: Autocomplete) {
  const { combobox, isMultiple } = autocomplete;
  const selectedOption = combobox.options.filter(selected)[0];

  if (isMultiple || !selectedOption) {
    autocomplete.inputValue = '';
  } else {
    autocomplete.inputValue = (selectedOption.getAttribute(AUTOCOMPLETE_VALUE_ATTR) ||
      selectedOption.textContent) as string;
  }
}

function selected(option: HTMLElement) {
  return option.getAttribute('aria-selected') === 'true';
}

function dispatchEvent(element: HTMLElement, name: string, options: CustomEventInit = {}) {
  element.dispatchEvent(new CustomEvent(`auto-complete:${name}`, { bubbles: true, ...options }));
}

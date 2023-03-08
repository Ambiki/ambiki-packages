import Combobox from '@ambiki/combobox';
import { enabled, debounce, outsideClick } from '@ambiki/utils';
import SingleSelection from './single-selection';
import MultiSelection from './multi-selection';
import { dispatchEvent, getValue, getLabel, makeAbortController, toArray } from './utils';
import type AutoCompleteElement from './element';
import type { MakeAbortControllerType, SetValueType } from './utils';

export type CommitEventType = {
  option: HTMLElement;
  label: string;
  value: string;
};

const DATA_EMPTY_ATTR = 'data-empty';

export default class AutoComplete {
  container: AutoCompleteElement;
  input: HTMLInputElement;
  list: HTMLElement;
  combobox: Combobox;
  clearButton: HTMLButtonElement | null;
  private initialClickTarget?: HTMLElement;
  private selectionVariant: SingleSelection | MultiSelection;
  private controller?: MakeAbortControllerType;
  private currentQuery?: string;
  private shouldFetch = true;

  constructor(container: AutoCompleteElement, input: HTMLInputElement, list: HTMLElement) {
    this.container = container;
    this.input = input;
    this.list = list;

    this.combobox = new Combobox(this.input, this.list, { multiple: this.container.multiple });
    this.selectionVariant = this.container.multiple
      ? new MultiSelection(this.container, this, this.input)
      : new SingleSelection(this.container, this, this.input);
    this.selectionVariant.initialize();

    // Set a11y attributes
    this.input.setAttribute('spellcheck', 'false');
    this.input.setAttribute('autocomplete', 'off');
    this.list.setAttribute('tabindex', '-1');
    this.list.setAttribute('aria-orientation', 'vertical');

    this.clearButton = this.container.querySelector('[data-clear]');
    if (this.clearButton && !this.clearButton.hasAttribute('aria-label')) {
      this.clearButton.setAttribute('aria-label', 'Clear autocomplete');
    }

    this.onMousedown = this.onMousedown.bind(this);
    this.onInputBlur = this.onInputBlur.bind(this);
    this.onInputMousedown = this.onInputMousedown.bind(this);
    this.onInput = debounce(this.onInput.bind(this), 300);
    this.onCommit = this.onCommit.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onClear = this.onClear.bind(this);
    this.onFormReset = this.onFormReset.bind(this);

    this.onDocumentMousedown = this.onDocumentMousedown.bind(this);
    this.onDocumentClick = this.onDocumentClick.bind(this);

    this.container.addEventListener('mousedown', this.onMousedown);
    this.input.addEventListener('blur', this.onInputBlur);
    this.input.addEventListener('mousedown', this.onInputMousedown);
    this.input.addEventListener('input', this.onInput);
    this.input.addEventListener('keydown', this.onKeydown);
    this.list.addEventListener('combobox:commit', this.onCommit);
    this.clearButton?.addEventListener('click', this.onClear);
    this.form?.addEventListener('reset', this.onFormReset);

    // Outside click
    document.addEventListener('mousedown', this.onDocumentMousedown, true);
    document.addEventListener('click', this.onDocumentClick, true);
  }

  /**
   * @description Completely destroys the `auto-complete` element
   */
  destroy() {
    this.hideList();
    this.selectionVariant.destroy();

    this.container.removeEventListener('mousedown', this.onMousedown);
    this.input.removeEventListener('blur', this.onInputBlur);
    this.input.removeEventListener('mousedown', this.onInputMousedown);
    this.input.removeEventListener('input', this.onInput);
    this.input.removeEventListener('keydown', this.onKeydown);
    this.list.removeEventListener('combobox:commit', this.onCommit);
    this.clearButton?.removeEventListener('click', this.onClear);
    this.form?.removeEventListener('reset', this.onFormReset);

    document.removeEventListener('mousedown', this.onDocumentMousedown, true);
    document.removeEventListener('click', this.onDocumentClick, true);
  }

  /**
   * @description Resets the selected options to the given value
   */
  setValue(value: SetValueType) {
    this.selectionVariant.setValue(value);
    if (!this.container.open) return;

    if (value.length === 0) {
      this.combobox.deselectAll();
      return;
    }

    const transformedValue = toArray(value).map((v) => v.value.toString());
    for (const option of this.options.filter((o) => transformedValue.includes(getValue(o)))) {
      this.combobox.select(option);
    }
  }

  /**
   * @description Removes the selected option that matches the provided value
   */
  removeValue(value: string) {
    this.selectionVariant.removeValue(value);
    const option = this.options.find((o) => getValue(o) === value);
    if (!option) return;

    this.combobox.deselect(option);
  }

  /**
   * @description Adds `data-active` attribute on the option element and sets `aria-activedescendant` attribute on the
   * input element
   */
  activate(option: HTMLElement, { scroll = false } = {}) {
    this.combobox.activate(option, { scroll });
  }

  /**
   * @description Removes `data-active` attribute from the option element and removes `aria-activedescendant` attribute
   * from the input element
   */
  deactivate() {
    this.combobox.deactivate();
  }

  /**
   * @description Deselects all the selected options and closes the list
   */
  clear() {
    this.currentQuery = undefined;
    this.selectionVariant.destroy();
    this.container.open = false;
  }

  async showList() {
    if (!this.list.hidden) return;

    dispatchEvent(this.container, 'show');
    this.combobox.start();
    if (this.shouldFetch) await this.fetchOptions();
    this.selectionVariant.connect();
    this.list.hidden = false;
    if (this.selectionVariant.firstActiveOption) {
      this.activate(this.selectionVariant.firstActiveOption, { scroll: true });
    }
    dispatchEvent(this.container, 'shown');
  }

  hideList() {
    if (this.list.hidden) return;

    dispatchEvent(this.container, 'hide');
    this.shouldFetch = true;
    this.currentQuery = undefined;
    this.combobox.stop();
    this.list.removeAttribute(DATA_EMPTY_ATTR);
    this.selectionVariant.disconnect();
    this.list.hidden = true;
    dispatchEvent(this.container, 'hidden');
  }

  /**
   * @description Returns all the options of the `auto-complete` element
   */
  get options() {
    return this.combobox.options;
  }

  /**
   * @description Returns all the options of the `auto-complete` element that are visible within the list
   */
  get visibleOptions() {
    return Array.from(this.list.querySelectorAll<HTMLElement>('[role="option"]:not([hidden])'));
  }

  /**
   * @description Returns the option that has the `data-active` attribute
   */
  get activeOption() {
    return this.combobox.activeOption;
  }

  private onDocumentMousedown(event: Event) {
    if (this.container.open) {
      this.initialClickTarget = (event.composedPath?.()?.[0] || event.target) as HTMLElement;
    }
  }

  // Unfortunately for some reason, Safari does not trigger `blur` event when clicking outside of the input field.
  // Hence, we need to manually close the list if the click was outside the container.
  private onDocumentClick(event: Event) {
    if (!this.initialClickTarget || !this.container.open) return;

    outsideClick(
      event,
      () => this.initialClickTarget as HTMLElement,
      [this.container, this.list],
      () => {
        this.container.open = false;
      }
    );

    this.initialClickTarget = undefined;
  }

  // Prevent input blur when interacting with the list.
  private onMousedown(event: Event) {
    if (event.target !== this.input) {
      event.preventDefault();
    }
  }

  private onInputBlur() {
    this.container.open = false;
    this.initialClickTarget = undefined;
  }

  private onInputMousedown() {
    this.container.open = true;
  }

  private async onCommit(event: Event) {
    const option = event.target;
    if (!(option instanceof HTMLElement) || !enabled(option)) return;

    await this.selectionVariant.onCommit(option);
    dispatchEvent<CommitEventType>(this.container, 'commit', {
      detail: {
        option,
        value: getValue(option),
        label: getLabel(option),
      },
    });
  }

  private onKeydown(event: KeyboardEvent) {
    this.shouldFetch = true;

    switch (event.key) {
      case 'Escape':
        if (this.container.open) {
          event.preventDefault();
          event.stopPropagation();
          this.container.open = false;
        }
        break;
      case 'ArrowDown':
        if (event.altKey && !this.container.open) {
          event.preventDefault();
          event.stopPropagation();
          this.container.open = true;
        }
        break;
      case 'ArrowUp':
        if (event.altKey && this.container.open) {
          event.preventDefault();
          event.stopPropagation();
          this.container.open = false;
        }
        break;
    }
  }

  private onClear(event: Event) {
    event.preventDefault();

    this.clear();
    this.input.focus();
    dispatchEvent(this.container, 'clear');
  }

  private async onInput(event: Event) {
    const query = (event.target as HTMLInputElement).value.trim();
    await this.fetchOptions(query);
    if (this.visibleOptions[0]) this.activate(this.visibleOptions[0]);
    this.container.open = true;
  }

  private async onFormReset() {
    this.currentQuery = undefined;
    await this.selectionVariant.reset();
    this.container.open = false;
  }

  async fetchOptions(query = '') {
    if (this.currentQuery === query) return;
    this.currentQuery = query;

    // After fetching the options, we show the list and subsequent callbacks including `fetchOptions` is run.
    // To avoid making multiple network request, we mark the flag as false.
    this.shouldFetch = false;

    if (!this.container.src) {
      this.options.forEach(filterOptions(query, { matching: 'data-label' }));
      this.checkIfListIsEmpty();
      this.selectionVariant.connect();
      return;
    }

    if (this.controller) {
      this.controller.abort();
    } else {
      this.container.setAttribute('loading', '');
      dispatchEvent(this.container, 'loadstart');
    }

    this.controller = makeAbortController();

    const url = new URL(this.container.src, window.location.href);
    const params = new URLSearchParams(url.search.slice(1));
    params.append(this.container.param, query);
    url.search = params.toString();

    try {
      const response = await fetch(url.toString(), {
        signal: this.controller.signal,
        credentials: 'same-origin',
        headers: {
          accept: 'text/fragment+html',
        },
      });
      this.list.innerHTML = await response.text();
      this.checkIfListIsEmpty();
      this.combobox.initializeOptions();
      this.selectionVariant.connect();
      this.container.removeAttribute('loading');
      dispatchEvent(this.container, 'success');
      dispatchEvent(this.container, 'loadend');
      this.controller = undefined;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        this.container.removeAttribute('loading');
        dispatchEvent(this.container, 'error');
        dispatchEvent(this.container, 'loadend');
        this.controller = undefined;
      }
    }
  }

  private checkIfListIsEmpty() {
    this.list.toggleAttribute(DATA_EMPTY_ATTR, this.visibleOptions.length === 0);
  }

  private get form() {
    return this.container.closest('form');
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

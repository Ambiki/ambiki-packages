import Combobox from '@ambiki/combobox';
import { debounce, nextTick } from '@ambiki/utils';
import type AutoCompleteElement from './index';
import type { SelectedOption } from './index';

const AUTOCOMPLETE_VALUE_ATTR = 'data-autocomplete-value';
const DATA_EMPTY_ATTR = 'data-empty';

export type ParsedValue = SelectedOption | SelectedOption[] | null;

export default class Autocomplete {
  element: AutoCompleteElement;
  input: HTMLInputElement;
  list: HTMLElement;
  selectedOptions: SelectedOption[];
  combobox: Combobox;
  currentQuery: string | null;
  clearButton: HTMLButtonElement | null;
  listObserver: MutationObserver;

  constructor(element: AutoCompleteElement, input: HTMLInputElement, list: HTMLElement) {
    this.element = element;
    this.input = input;
    this.list = list;
    this.selectedOptions = [];
    this.setSelectedOptions(this.value); // Fill the array with user passed value

    this.hideList();
    this.combobox = new Combobox(this.input, this.list, { multiple: this.element.multiple, max: this.element.max });
    this.currentQuery = null;

    // Reset button
    this.clearButton = this.element.querySelector('[data-autocomplete-clear]');
    if (this.clearButton && !this.clearButton.hasAttribute('aria-label')) {
      this.clearButton.setAttribute('aria-label', 'Clear autocomplete');
    }

    this.input.setAttribute('spellcheck', 'false');
    this.input.setAttribute('autocomplete', 'off');
    this.list.setAttribute('tabindex', '-1');
    this.list.setAttribute('aria-orientation', 'vertical');

    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onCommit = this.onCommit.bind(this);
    this.onInput = debounce(this.onInput.bind(this), 300);
    this.onKeydown = this.onKeydown.bind(this);
    this.onPointerdown = this.onPointerdown.bind(this);
    this.onClear = this.onClear.bind(this);

    this.input.addEventListener('focus', this.onFocus);
    this.input.addEventListener('blur', this.onBlur);
    this.input.addEventListener('input', this.onInput);
    this.input.addEventListener('pointerdown', this.onPointerdown);
    this.input.addEventListener('keydown', this.onKeydown);
    this.list.addEventListener('combobox:commit', this.onCommit);
    this.clearButton?.addEventListener('click', this.onClear);

    this.listObserver = new MutationObserver(this.onListToggle.bind(this));
    this.listObserver.observe(this.list, { attributes: true, attributeFilter: ['hidden'] });
  }

  destroy(): void {
    this.hideList();
    this.combobox.stop();

    this.input.removeEventListener('focus', this.onFocus);
    this.input.removeEventListener('blur', this.onBlur);
    this.input.removeEventListener('input', this.onInput);
    this.input.removeEventListener('pointerdown', this.onPointerdown);
    this.input.removeEventListener('keydown', this.onKeydown);
    this.list.removeEventListener('combobox:commit', this.onCommit);
    this.clearButton?.removeEventListener('click', this.onClear);

    this.listObserver.disconnect();
  }

  onFocus(): void {
    this.showList();
  }

  async onBlur(event: FocusEvent) {
    const { relatedTarget } = event;
    if (!(relatedTarget instanceof HTMLElement)) {
      this.hideList();
      return;
    }

    /**
     * Trick to keep focus on the input field after clicking inside the list. We could've used `this.input.focus()`,
     * but that blurs the input for a moment and then focuses back which causes a noticeable transition between
     * the state
     */
    const list = relatedTarget.closest<HTMLElement>('[role="listbox"]');
    if (list) {
      // Wait for nextTick before focusing (Firefox edge case)
      await nextTick();
      this.input.focus();
    } else {
      this.hideList();
    }
  }

  async onListToggle(): Promise<void> {
    if (this.list.hidden) {
      dispatchEvent(this.element, 'hide');
      this.onClose();
      dispatchEvent(this.element, 'hidden');
    } else {
      dispatchEvent(this.element, 'show');
      await this.onOpen();
      // Fire `shown` event after we fetch all the options
      dispatchEvent(this.element, 'shown');
    }
  }

  async onOpen() {
    this.combobox.start();

    // Only fetch results with empty query when the input is blank or if it contains a value that has already been
    // selected. This is kind of dirty, but it works.
    const inputValue = this.input.value.trim();
    const selectedValues = this.value.map(({ value }) => value.trim());
    if (inputValue.length === 0 || selectedValues.includes(inputValue)) {
      await this.fetchResults();
    }

    this.combobox.setInitialAttributesOnOptions(this.selectedOptionIds);
    this.activateFirstOrSelectedOption();
    this.checkIfListIsEmpty();
  }

  onClose() {
    this.combobox.stop();
    this.list.removeAttribute(DATA_EMPTY_ATTR);

    // Clear out input field after closing the list for multi-select element
    if (this.element.multiple) {
      this.input.value = '';
      return;
    }

    this.setInputValueWithSelectedValue();
  }

  onPointerdown() {
    if (!this.list.hidden) return;
    // Return early so that `onFocus` logic can be called
    if (document.activeElement !== this.input) return;

    this.showList();
  }

  async onInput(event: Event) {
    const query = (event.target as HTMLInputElement).value.trim();
    await this.fetchResults(query);

    this.combobox.setActive(this.combobox.visibleOptions[0]);
    this.checkIfListIsEmpty();

    this.showList();
  }

  async onCommit(event: Event): Promise<void> {
    const option = event.target;
    if (!(option instanceof HTMLElement)) return;

    const value = option.getAttribute(AUTOCOMPLETE_VALUE_ATTR) || option.textContent || '';
    this.addOrRemoveOption({ id: option.id, value });
    this.updateValueWithSelectedOptions();

    if (this.element.multiple) {
      // Clear out the input field and activate the selected option or the first visible option
      this.input.value = '';
      await this.fetchResults();
      const selectedOrFirstOption =
        this.combobox.options.find((o) => o.id === option.id) || this.combobox.visibleOptions[0];
      this.combobox.setActive(selectedOrFirstOption);
      this.checkIfListIsEmpty();
    } else {
      // We want to hide the list after selecting an option for single-select auto-complete
      this.hideList();
    }

    dispatchEvent(this.element, 'commit', { detail: { relatedTarget: option } });
  }

  onClear(event: MouseEvent) {
    event.preventDefault();

    // Clear state
    this.element.value = '';
    this.input.focus();

    // We don't want the list to open after focusing on the `input` field
    this.hideList();
    // Should fire after closing the list
    dispatchEvent(this.element, 'clear');
  }

  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        if (!this.list.hidden) {
          this.hideList();
          event.preventDefault();
          event.stopPropagation();
        }
        break;
      case 'ArrowDown':
        if (event.altKey && this.list.hidden) {
          this.showList();
          event.preventDefault();
          event.stopPropagation();
        }
        break;
      case 'ArrowUp':
        if (event.altKey && !this.list.hidden) {
          this.hideList();
          event.preventDefault();
          event.stopPropagation();
        }
        break;
      default:
        break;
    }
  }

  activateFirstOrSelectedOption(): void {
    const selectedOption = this.getFirstSelectedOption(this.combobox.options);
    const firstOption = selectedOption || this.combobox.visibleOptions[0];
    this.combobox.setActive(firstOption);
  }

  addOrRemoveOption(object: SelectedOption): void {
    if (this.element.multiple) {
      const optionIndex = this.selectedOptions.findIndex(({ id }) => id.toString() === object.id.toString());

      if (optionIndex !== -1) {
        this.selectedOptions.splice(optionIndex, 1);
      } else {
        this.selectedOptions.push(object);
      }
    } else {
      this.selectedOptions = [];
      this.selectedOptions.push(object);
    }
  }

  setInputValueWithSelectedValue() {
    if (this.element.multiple) return;

    const option = this.getFirstSelectedOption(this.selectedOptions);
    if (!option) {
      this.input.value = '';
      return;
    }

    this.input.value = option.value;
  }

  updateValueWithSelectedOptions() {
    const value = JSON.stringify(this.element.multiple ? this.selectedOptions : this.selectedOptions[0]);
    this.element.value = value;
  }

  getFirstSelectedOption<T extends { id: string }>(options: T[]): T | undefined {
    return options.find((o) => this.selectedOptionIds.includes(o.id.toString()));
  }

  checkIfListIsEmpty() {
    this.list.toggleAttribute(DATA_EMPTY_ATTR, this.combobox.visibleOptions.length === 0);
  }

  async fetchResults(query = '') {
    // If there's no `src`, then we know that all the options are present inside the list
    if (!this.element.src) {
      this.combobox.options.forEach(filterOptions(query, { matching: AUTOCOMPLETE_VALUE_ATTR }));
      // Select the option(s) which matches the value
      this.combobox.setInitialAttributesOnOptions(this.selectedOptionIds);
      return;
    }

    // Cache query so that we don't make network request for the same `query`
    if (this.currentQuery === query) return;
    this.currentQuery = query;

    const url = new URL(this.element.src, window.location.href);
    const params = new URLSearchParams(url.search.slice(1));
    params.append(this.element.param, query);
    url.search = params.toString();

    dispatchEvent(this.element, 'loadstart');
    try {
      const response = await fetch(url.toString(), {
        credentials: 'same-origin',
        headers: {
          accept: 'text/fragment+html',
        },
      });
      const html = await response.text();
      this.list.innerHTML = html;
      // Select the option(s) which matches the value
      this.combobox.setInitialAttributesOnOptions(this.selectedOptionIds);

      dispatchEvent(this.element, 'success');
      dispatchEvent(this.element, 'loadend');
    } catch (error) {
      dispatchEvent(this.element, 'error');
      dispatchEvent(this.element, 'loadend');
    }
  }

  get value(): SelectedOption[] {
    try {
      const parsedValue = JSON.parse(this.element.value) as ParsedValue;
      if (!parsedValue) throw new Error();
      if (Array.isArray(parsedValue)) return parsedValue;

      return [parsedValue];
    } catch {
      return [];
    }
  }

  set value(value: string | SelectedOption[]) {
    const _value = typeof value === 'string' ? value : JSON.stringify(value);

    try {
      const parsedValue = JSON.parse(_value) as ParsedValue;
      if (!parsedValue) throw new Error();

      if (Array.isArray(parsedValue)) {
        this.setSelectedOptions(parsedValue);
        return;
      }

      this.setSelectedOptions([parsedValue]);
    } catch {
      this.setSelectedOptions([]);
    }
  }

  setSelectedOptions(options: SelectedOption[]) {
    this.selectedOptions = options;
    this.setInputValueWithSelectedValue();
  }

  get selectedOptionIds() {
    return this.value.map(({ id }) => id.toString());
  }

  showList() {
    if (!this.list.hidden) return;
    this.list.hidden = false;
  }

  hideList() {
    if (this.list.hidden) return;
    this.list.hidden = true;
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

function dispatchEvent(element: HTMLElement, name: string, options: CustomEventInit = {}) {
  element.dispatchEvent(new CustomEvent(`auto-complete:${name}`, { bubbles: true, ...options }));
}

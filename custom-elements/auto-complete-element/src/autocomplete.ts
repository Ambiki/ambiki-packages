import Combobox from '@ambiki/combobox';
import { debounce, handleOutsideClick, nextTick } from '@ambiki/utils';
import type AutoCompleteElement from './index';
import type { SelectedOption } from './index';

const AUTOCOMPLETE_VALUE_ATTR = 'data-autocomplete-value';
const DATA_EMPTY_ATTR = 'data-empty';

export default class Autocomplete {
  element: AutoCompleteElement;
  input: HTMLInputElement;
  list: HTMLElement;
  selectedOptions: SelectedOption[];
  combobox: Combobox;
  initialClickTarget: EventTarget | null;
  currentQuery: string | null;
  clearButton: HTMLButtonElement | null;
  listObserver: MutationObserver;

  constructor(element: AutoCompleteElement, input: HTMLInputElement, list: HTMLElement) {
    this.element = element;
    this.input = input;
    this.list = list;
    this.selectedOptions = this.value; // Fill array with user passed value

    this.list.hidden = true;
    this.combobox = new Combobox(this.input, this.list, { multiple: this.multiple, max: this.max });
    this.initialClickTarget = null;
    this.currentQuery = null;

    // Reset button
    this.clearButton = this.element.querySelector('[data-autocomplete-clear]');
    if (this.clearButton && !this.clearButton.hasAttribute('aria-label')) {
      this.clearButton.setAttribute('aria-label', 'Clear autocomplete');
    }

    if (!this.multiple) this.populateInputWithSelectedValue();

    this.input.setAttribute('spellcheck', 'false');
    this.input.setAttribute('autocomplete', 'off');
    this.list.setAttribute('tabindex', '-1');
    this.list.setAttribute('aria-orientation', 'vertical');

    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onMousedown = this.onMousedown.bind(this);
    this.onOutsideInteraction = this.onOutsideInteraction.bind(this);
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

    document.addEventListener('mousedown', this.onMousedown, true);
    document.addEventListener('click', this.onOutsideInteraction, true);

    this.listObserver = new MutationObserver(this.onListToggle.bind(this));
    this.listObserver.observe(this.list, { attributes: true, attributeFilter: ['hidden'] });
  }

  destroy(): void {
    this.list.hidden = true;
    this.combobox.stop();

    this.input.removeEventListener('focus', this.onFocus);
    this.input.removeEventListener('blur', this.onBlur);
    this.input.removeEventListener('input', this.onInput);
    this.input.removeEventListener('pointerdown', this.onPointerdown);
    this.input.removeEventListener('keydown', this.onKeydown);
    this.list.removeEventListener('combobox:commit', this.onCommit);
    this.clearButton?.removeEventListener('click', this.onClear);

    document.removeEventListener('mousedown', this.onMousedown, true);
    document.removeEventListener('click', this.onOutsideInteraction, true);

    this.listObserver.disconnect();
  }

  onFocus(): void {
    if (!this.list.hidden) return;
    this.list.hidden = false;
  }

  async onBlur(event: FocusEvent) {
    const { relatedTarget } = event;
    if (!(relatedTarget instanceof HTMLElement)) return;

    // Close list when the focus moves outside of the auto-complete element
    if (!this.element.contains(relatedTarget) && !this.list.contains(relatedTarget)) {
      this.list.hidden = true;
      return;
    }

    const option = relatedTarget.closest<HTMLElement>('[role="option"]');
    if (!option) return;

    // Trick to keep focus on the input field after clicking on the option. We could've used `this.input.focus()`,
    // but that blurs the input for a moment and then focuses back which causes a noticeable transition between
    // the state
    await nextTick(); // Wait for nextTick before focusing (Firefox edge case)
    this.input.focus();
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

    this.activateFirstOrSelectedOption();
    this.checkIfListIsEmpty();
  }

  onClose() {
    this.combobox.stop();
    this.list.removeAttribute(DATA_EMPTY_ATTR);

    // Clear out input field after closing the list for multi-select element
    if (this.multiple) {
      this.input.value = '';
      return;
    }

    this.populateInputWithSelectedValue();
  }

  onPointerdown() {
    if (!this.list.hidden) return;
    // Return early so that `onFocus` logic can be called
    if (document.activeElement !== this.input) return;

    this.list.hidden = false;
  }

  async onInput(event: Event) {
    const query = (event.target as HTMLInputElement).value.trim();
    await this.fetchResults(query);

    this.combobox.setActive(this.combobox.visibleOptions[0]);
    this.checkIfListIsEmpty();

    if (this.list.hidden) {
      this.list.hidden = false;
    }
  }

  onCommit(event: Event): void {
    const option = event.target;
    if (!(option instanceof HTMLElement)) return;

    const value = option.getAttribute(AUTOCOMPLETE_VALUE_ATTR) || option.textContent || '';
    this.addOrRemoveOption({ id: option.id, value });
    this.updateValueWithSelectedOptions();
    // We want to hide the list after selecting an option for single-select auto-complete
    if (!this.multiple) this.list.hidden = true;

    dispatchEvent(this.element, 'commit', { detail: { relatedTarget: option } });
  }

  onClear(event: Event) {
    event.preventDefault();

    // Clear state
    this.selectedOptions = [];
    this.updateValueWithSelectedOptions();
    // Deselect selected options
    for (const option of this.combobox.options.filter(selected)) {
      option.setAttribute('aria-selected', 'false');
    }

    this.input.value = '';
    this.input.focus();

    // We don't want the list to open after focusing on the `input` field
    if (!this.list.hidden) {
      this.list.hidden = true;
    }

    // Should fire after closing the list
    dispatchEvent(this.element, 'clear');
  }

  onMousedown(event: MouseEvent): void {
    this.initialClickTarget = event.composedPath?.()?.[0] || event.target;
  }

  onOutsideInteraction(event: MouseEvent | FocusEvent): void {
    if (this.list.hidden || !this.initialClickTarget) return;

    handleOutsideClick(
      event,
      () => {
        return this.initialClickTarget as HTMLElement;
      },
      [this.element, this.list],
      () => {
        this.list.hidden = true;
      }
    );

    this.initialClickTarget = null;
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
          this.list.hidden = false;
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

  activateFirstOrSelectedOption(): void {
    const selectedOption = this.getFirstSelectedOption(this.combobox.options);
    const firstOption = selectedOption || this.combobox.visibleOptions[0];
    this.combobox.setActive(firstOption);
  }

  addOrRemoveOption(object: SelectedOption): void {
    if (this.multiple) {
      const optionIndex = this.selectedOptions.findIndex((o) => o.id === object.id);

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

  populateInputWithSelectedValue() {
    const option = this.getFirstSelectedOption(this.selectedOptions);
    if (!option) {
      this.input.value = '';
      return;
    }

    this.input.value = option.value;
  }

  updateValueWithSelectedOptions() {
    const value = JSON.stringify(this.multiple ? this.selectedOptions : this.selectedOptions[0]);
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
    if (!this.src) {
      this.combobox.options.forEach(filterOptions(query, { matching: AUTOCOMPLETE_VALUE_ATTR }));
      // Select the option(s) which matches the value
      this.combobox.setInitialAttributesOnOptions(this.selectedOptionIds);
      return;
    }

    // Cache query so that we don't make network request for the same `query`
    if (this.currentQuery === query) return;
    this.currentQuery = query;

    const url = new URL(this.src, window.location.href);
    const params = new URLSearchParams(url.search.slice(1));
    params.append('q', query);
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

  get multiple(): boolean {
    return this.element.multiple;
  }

  get max(): number {
    return this.element.max;
  }

  get src(): string {
    return this.element.src;
  }

  get value(): SelectedOption[] {
    const { value } = this.element;
    if (!value) return [];

    try {
      const parsedValue = JSON.parse(value) as SelectedOption | SelectedOption[];
      if (Array.isArray(parsedValue)) return parsedValue;

      return [parsedValue];
    } catch {
      return [];
    }
  }

  get selectedOptionIds() {
    return this.value.map(({ id }) => id.toString());
  }
}

// export default class Autocomplete {
//   element: AutoCompleteElement;
//   input: HTMLInputElement;
//   list: HTMLElement;
//   selectedOptions: Set<string>;
//   resetButton: HTMLElement | null;
//   combobox: Combobox;
//   listObserver: MutationObserver;
//   currentQuery: string | null;
//
//   constructor(element: AutoCompleteElement, input: HTMLInputElement, list: HTMLElement) {
//     this.element = element;
//     this.input = input;
//     this.list = list;
//
//     this.selectedOptions = new Set();
//     this.currentQuery = null;
//
//     this.list.hidden = true;
//     this.combobox = new Combobox(this.input, this.list, { multiple: this.element.multiple, max: this.element.max });
//
//     this.input.setAttribute('spellcheck', 'false');
//     this.input.setAttribute('autocomplete', 'off');
//     this.list.setAttribute('tabindex', '-1');
//     this.list.setAttribute('aria-orientation', 'vertical');
//
//     // Reset button
//     this.resetButton = this.element.querySelector('[data-autocomplete-reset]');
//     if (this.resetButton && !this.resetButton.hasAttribute('aria-label')) {
//       this.resetButton.setAttribute('aria-label', 'reset autocomplete');
//     }
//
//     this.onFocus = this.onFocus.bind(this);
//     this.onPointerDown = this.onPointerDown.bind(this);
//     this.onKeydown = this.onKeydown.bind(this);
//     this.onCommit = this.onCommit.bind(this);
//     this.onInput = debounce(this.onInput.bind(this), 300);
//     this.onBlur = this.onBlur.bind(this);
//     this.handleReset = this.handleReset.bind(this);
//
//     this.input.addEventListener('focus', this.onFocus);
//     this.input.addEventListener('blur', this.onBlur);
//     this.input.addEventListener('pointerdown', this.onPointerDown); // We use `pointerdown` instead of `click` to simulate the `focus` event
//     this.input.addEventListener('keydown', this.onKeydown);
//     this.input.addEventListener('input', this.onInput);
//     this.list.addEventListener('combobox:commit', this.onCommit);
//     this.resetButton?.addEventListener('click', this.handleReset);
//
//     this.listObserver = new MutationObserver(this.onListToggle.bind(this));
//     this.listObserver.observe(this.list, { attributes: true, attributeFilter: ['hidden'] });
//   }
//
//   destroy() {
//     this.input.removeEventListener('focus', this.onFocus);
//     this.input.removeEventListener('blur', this.onBlur);
//     this.input.removeEventListener('pointerdown', this.onPointerDown);
//     this.input.removeEventListener('keydown', this.onKeydown);
//     this.input.removeEventListener('input', this.onInput);
//     this.list.removeEventListener('combobox:commit', this.onCommit);
//     this.resetButton?.removeEventListener('click', this.handleReset);
//
//     this.listObserver.disconnect();
//   }
//
//   onListToggle() {
//     if (this.list.hidden) {
//       dispatchEvent(this.element, 'hide');
//       this.combobox.stop();
//       this.list.removeAttribute(DATA_EMPTY_ATTR);
//       syncSelection(this);
//       dispatchEvent(this.element, 'hidden');
//     } else {
//       dispatchEvent(this.element, 'show');
//       this.combobox.start();
//       this.list.toggleAttribute(DATA_EMPTY_ATTR, this.combobox.visibleOptions.length === 0);
//       dispatchEvent(this.element, 'shown');
//     }
//   }
//
//   onFocus() {
//     if (!this.list.hidden) return;
//
//     this.openAndInitializeList();
//   }
//
//   onPointerDown() {
//     if (!this.list.hidden) return;
//     if (document.activeElement !== this.input) return; // If it's not already active, then `onFocus` logic will apply
//
//     this.openAndInitializeList();
//   }
//
//   onKeydown(event: KeyboardEvent) {
//     switch (event.key) {
//       case 'Escape':
//         if (!this.list.hidden) {
//           this.list.hidden = true;
//           event.preventDefault();
//           event.stopPropagation();
//         }
//         break;
//       case 'ArrowDown':
//         if (event.altKey && this.list.hidden) {
//           this.openAndInitializeList();
//           event.preventDefault();
//           event.stopPropagation();
//         }
//         break;
//       case 'ArrowUp':
//         if (event.altKey && !this.list.hidden) {
//           this.list.hidden = true;
//           event.preventDefault();
//           event.stopPropagation();
//         }
//         break;
//       default:
//         break;
//     }
//   }
//
//   async onInput() {
//     if (this.list.hidden) {
//       this.list.hidden = false;
//     }
//
//     const query = this.input.value.trim();
//     if (this.element.src) {
//       await this.fetchResults(query);
//     } else {
//       this.filterListWithQuery(query);
//     }
//
//     this.combobox.setActive(this.combobox.visibleOptions[0]);
//     this.list.toggleAttribute(DATA_EMPTY_ATTR, this.combobox.visibleOptions.length === 0);
//   }
//
//   onCommit(event: Event) {
//     const option = event.target;
//     if (!(option instanceof HTMLElement)) return;
//
//     const value = (option.getAttribute(AUTOCOMPLETE_VALUE_ATTR) || option.textContent) as string;
//     if (this.element.multiple) {
//       if (this.input.value) {
//         this.inputValue = '';
//         this.filterListWithQuery();
//         this.combobox.setActive(option);
//       }
//     } else {
//       this.inputValue = value;
//       this.list.hidden = true;
//     }
//
//     this.addOrRemoveSelectedOptionFromSet(option.id);
//     this.element.value = option.getAttribute(AUTOCOMPLETE_VALUE_ATTR) || option.textContent || '';
//     dispatchEvent(this.element, 'selected', { detail: { relatedTarget: option } });
//   }
//
//   async onBlur(event: FocusEvent) {
//     const { relatedTarget } = event;
//     if (!(relatedTarget instanceof HTMLElement)) {
//       this.list.hidden = true;
//       return;
//     }
//
//     const list = relatedTarget.closest<HTMLElement>('[role="listbox"]');
//     if (list) {
//       await nextTick(); // Wait for nextTick before focusing (Firefox edge case)
//       this.input.focus(); // Always keep focus on the input field when interacting with the list
//     } else {
//       this.list.hidden = true; // Hide the list for other elements that triggered the blur
//     }
//   }
//
//   async handleReset(event: Event) {
//     event.preventDefault();
//
//     this.selectedOptions.clear();
//     this.element.value = '';
//     for (const option of this.combobox.options.filter(selected)) {
//       option.setAttribute('aria-selected', 'false');
//     }
//     syncSelection(this);
//     this.input.focus();
//
//     await nextTick();
//     if (!this.list.hidden) {
//       this.list.hidden = true;
//     }
//
//     // Should fire after closing the list
//     dispatchEvent(this.element, 'reset');
//   }
//
//   async openAndInitializeList() {
//     this.list.hidden = false;
//     if (this.element.src) {
//       await this.fetchResults();
//     } else {
//       this.filterListWithQuery();
//     }
//
//     this.activateFirstOrSelectedOption();
//   }
//
//   async fetchResults(query = '') {
//     if (!this.element.src) return;
//     if (this.currentQuery === query) return;
//
//     this.currentQuery = query;
//     console.log('fetching');
//
//     const url = new URL(this.element.src, window.location.href);
//     const params = new URLSearchParams(url.search.slice(1));
//     params.append('q', query);
//     url.search = params.toString();
//
//     try {
//       const response = await fetch(url.toString(), {
//         credentials: 'same-origin',
//         headers: {
//           accept: 'text/fragment+html',
//         },
//       });
//       const html = await response.text();
//       this.list.innerHTML = html;
//       this.combobox.setInitialAttributesOnOptions();
//     } catch (error) {
//       console.log(error);
//     }
//   }
//
//   filterListWithQuery(query = '') {
//     this.combobox.options.forEach(filterOptions(query, { matching: AUTOCOMPLETE_VALUE_ATTR }));
//   }
//
//   async activateFirstOrSelectedOption() {
//     const firstSelectedOption = this.combobox.options.find((option) => option.id === [...this.selectedOptions][0]);
//     const firstOption = firstSelectedOption || this.combobox.visibleOptions[0];
//     await nextTick(); // `aria-activedescendant` on input field isn't always set, so we need to wait for the next tick
//     this.combobox.setActive(firstOption);
//   }
//
//   addOrRemoveSelectedOptionFromSet(id: string) {
//     if (this.element.multiple) {
//       if (this.selectedOptions.has(id)) {
//         this.selectedOptions.delete(id);
//       } else {
//         this.selectedOptions.add(id);
//       }
//
//       return;
//     }
//
//     this.selectedOptions.clear();
//     this.selectedOptions.add(id);
//   }
//
//   set inputValue(value: string) {
//     this.input.value = value;
//     this.input.dispatchEvent(new Event('change'));
//   }
// }

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

// function syncSelection(autocomplete: Autocomplete) {
//   if (autocomplete.element.multiple) {
//     autocomplete.inputValue = '';
//     return;
//   }
//
//   autocomplete.inputValue = autocomplete.element.value;
// }

function selected(option: HTMLElement) {
  return option.getAttribute('aria-selected') === 'true';
}

function dispatchEvent(element: HTMLElement, name: string, options: CustomEventInit = {}) {
  element.dispatchEvent(new CustomEvent(`auto-complete:${name}`, { bubbles: true, ...options }));
}

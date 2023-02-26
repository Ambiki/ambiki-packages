import BaseSelection from './base-selection';
import { nextTick } from '@ambiki/utils';
import { dispatchEvent } from './utils';
import type { SetValueType } from './utils';

export default class MultiSelection extends BaseSelection {
  /**
   * @description Returns all the option element's `value` attribute
   */
  selectedValues!: Set<string>;

  override initialize() {
    this.selectedValues = new Set([...parseJSON(this.container.value)]);
  }

  override connect() {
    this.identifySelectionState();
  }

  override disconnect() {
    this.clearInput();
  }

  override destroy() {
    this.selectedValues.clear();
    this.updateContainerWithSelectedValues();
  }

  /**
   * @description Clears the input value, updates the state
   */
  async onCommit(option: HTMLElement) {
    this.clearInput();

    const value = this.getValue(option);
    const label = this.getLabel(option);

    if (this.selectedValues.has(value)) {
      this.removeValue(value);
      dispatchEvent(this.container, 'deselect', { detail: { option, value, label } });
    } else {
      this.setValue([{ value }]);
      dispatchEvent(this.container, 'select', { detail: { option, value, label } });
    }

    await this.autocomplete.fetchOptions();
    // Activate selected/deselected option
    await nextTick();
    const visibleOption =
      this.autocomplete.visibleOptions.find((o) => o.id === option.id) || this.autocomplete.visibleOptions[0];
    if (visibleOption) this.autocomplete.activate(visibleOption, { scroll: true });
  }

  /**
   * @description Adds the value to the state and updates the `value` attribute on the `auto-complete` element
   */
  setValue(value: SetValueType) {
    if (value.length === 0) {
      this.destroy();
      return;
    }

    for (const _value of value) {
      this.selectedValues.add(_value.value.toString());
    }

    this.updateContainerWithSelectedValues();
  }

  /**
   * @description Removes the value from the state and updates the `value` attribute on the `auto-complete` element
   */
  removeValue(value: string) {
    if (!this.selectedValues.has(value)) return;

    this.selectedValues.delete(value);
    this.updateContainerWithSelectedValues();
  }

  private identifySelectionState() {
    for (const option of this.autocomplete.options) {
      if (this.selectedValues.has(this.getValue(option))) {
        this.autocomplete.combobox.select(option);
      } else {
        this.autocomplete.combobox.deselect(option);
      }
    }
  }

  /**
   * @description Returns the first focusable option element
   */
  get firstActiveOption(): HTMLElement | undefined {
    const option = this.autocomplete.visibleOptions.find((o) => this.selectedValues.has(this.getValue(o)));
    return option || this.autocomplete.visibleOptions[0];
  }

  private updateContainerWithSelectedValues() {
    const values = Array.from(this.selectedValues.values());
    this.container.value = JSON.stringify(values);
  }

  private clearInput() {
    if (this.input.value) {
      this.input.value = '';
    }
  }
}

function parseJSON(value: string): string[] {
  try {
    const parsedValue = JSON.parse(value) as string[];
    return parsedValue.map((e) => e.toString());
  } catch {
    return [];
  }
}

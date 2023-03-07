import BaseSelection from './base-selection';
import { nextTick } from '@ambiki/utils';
import { dispatchEvent } from './utils';
import type { SetValueType } from './utils';
import type { CommitEventType } from './auto-complete';

export default class MultiSelection extends BaseSelection {
  /**
   * @description Returns all the option element's `value` attribute
   */
  selectedValues!: Set<string>;

  override initialize() {
    this.selectedValues = new Set([...parseJSON(this.container.value)]);

    if (this.container.name) {
      this.insertHiddenField({ value: '' });
      this.selectedValues.forEach((value) => this.insertHiddenField({ value, variant: 'item' }));
    }
  }

  override connect() {
    this.identifySelectionState();
  }

  override disconnect() {
    this.clearInput();
  }

  override destroy() {
    this.selectedValues.forEach((value) => this.removeHiddenField(value));
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
    const detail = { option, value, label };

    if (this.selectedValues.has(value)) {
      this.removeValue(value);
      dispatchEvent<CommitEventType>(this.container, 'deselect', { detail });
    } else {
      this.setValue([{ value }]);
      dispatchEvent<CommitEventType>(this.container, 'select', { detail });
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
      this.insertHiddenField({ value: _value.value.toString(), variant: 'item' });
    }

    this.updateContainerWithSelectedValues();
  }

  /**
   * @description Removes the value from the state and updates the `value` attribute on the `auto-complete` element
   */
  removeValue(value: string) {
    if (!this.selectedValues.has(value)) return;

    this.selectedValues.delete(value);
    this.removeHiddenField(value);
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

  private insertHiddenField({ value, variant = 'base' }: { value: string; variant?: 'base' | 'item' }) {
    const hiddenField = document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = this.container.name;
    hiddenField.value = value;
    hiddenField.dataset.variant = variant;
    if (variant === 'item') {
      hiddenField.dataset.value = value;
    }

    this.container.append(hiddenField);
  }

  private removeHiddenField(value: string) {
    const hiddenField = this.container.querySelector(`input[type="hidden"][data-value="${value}"]`);
    hiddenField?.remove();
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

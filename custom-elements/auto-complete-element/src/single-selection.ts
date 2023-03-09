import BaseSelection from './base-selection';
import { dispatchEvent } from './utils';
import type { SetValueType } from './utils';
import type { CommitEventType } from './auto-complete';
import { nextTick } from '@ambiki/utils';

export default class SingleSelection extends BaseSelection {
  private defaultValue?: string;
  private defaultLabel?: string;

  override initialize() {
    // If `data-label` attribute is not passed and we find a selected option, use its label
    if (!this.container.label && this.selectedOption) {
      this.container.label = this.getLabel(this.selectedOption);
    }

    // Store value and label attribute so that we can restore it when the parent form fires a `reset` event.
    this.defaultValue = this.container.value;
    this.defaultLabel = this.container.label;

    if (this.container.name) {
      this.insertHiddenField({ value: this.container.value });
    }

    this.input.value = this.container.label;
  }

  override connect() {
    this.identifySelectionState();
  }

  override disconnect() {
    if (this.input.value !== this.container.label) {
      this.input.value = this.container.label;
    }
  }

  override destroy() {
    this.removeValue();
  }

  /**
   * @description Updates the value of the input field and hides the list
   */
  onCommit(option: HTMLElement) {
    const value = this.getValue(option);
    const label = this.getLabel(option);

    this.container.value = value;
    this.container.label = label;
    this.hiddenFieldValue = value;
    this.input.value = label;
    this.container.open = false;
    dispatchEvent<CommitEventType>(this.container, 'select', { detail: { option, value, label } });
  }

  /**
   * @description Sets the value attribute on the `auto-complete` element. Additionally, it also tries to set the
   * value of the input field
   */
  setValue(value: SetValueType) {
    const _value = value[0];
    if (!_value) {
      this.removeValue();
      return;
    }

    this.container.value = _value.value.toString();
    this.hiddenFieldValue = _value.value.toString();
    const option = this.selectedOption;

    const label = _value.label || (option ? this.getLabel(option) : '');
    this.container.label = label;
    this.input.value = label;
  }

  /**
   * @description Removes the value and label attribute from the `auto-complete` element, and it also clears the
   * value of the input field
   */
  removeValue() {
    this.container.value = '';
    this.container.label = '';
    this.hiddenFieldValue = '';
    this.input.value = '';
  }

  async reset() {
    this.container.value = this.defaultValue;
    this.container.label = this.defaultLabel || '';
    this.hiddenFieldValue = this.defaultValue || '';

    await nextTick();
    this.input.value = this.defaultLabel || '';
  }

  /**
   * @description Returns the first focusable option element
   */
  get firstActiveOption(): HTMLElement | undefined {
    const option = this.autocomplete.visibleOptions.find((o) => this.maySelect(o));
    return option || this.autocomplete.visibleOptions[0];
  }

  /**
   * @description Returns the `value` attribute of the selected option element
   */
  get selectedValue(): string {
    return this.container.value;
  }

  private identifySelectionState() {
    if (!this.selectedOption) return;
    this.autocomplete.combobox.select(this.selectedOption);
  }

  private get selectedOption(): HTMLElement | undefined {
    return this.autocomplete.options.find((o) => this.maySelect(o));
  }

  private maySelect(option: HTMLElement): boolean {
    if (!this.selectedValue) return false;
    return this.getValue(option) === this.selectedValue;
  }

  private get hiddenField() {
    return this.container.querySelector<HTMLInputElement>(`input[name="${this.container.name}"][data-variant='base']`);
  }

  private set hiddenFieldValue(value: string) {
    if (!this.hiddenField) return;
    this.hiddenField.value = value;
  }
}

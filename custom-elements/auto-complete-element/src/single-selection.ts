import BaseSelection from './base-selection';
import { dispatchEvent } from './utils';
import type { SetValueType } from './utils';

export default class SingleSelection extends BaseSelection {
  override initialize() {
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
    this.input.value = label;
    this.container.open = false;
    dispatchEvent(this.container, 'select', { detail: { option, value, label } });
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
    const option = this.autocomplete.options.find((o) => this.maySelect(o));

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
    this.input.value = '';
  }

  private identifySelectionState() {
    const option = this.autocomplete.options.find((o) => this.maySelect(o));
    if (!option) return;
    this.autocomplete.combobox.select(option);
  }

  /**
   * @description Returns the first focusable option element
   */
  get firstActiveOption(): HTMLElement | undefined {
    const option = this.autocomplete.visibleOptions.find((o) => this.maySelect(o));
    return option || this.autocomplete.visibleOptions[0];
  }

  private maySelect(option: HTMLElement): boolean {
    if (!this.selectedValue) return false;
    return this.getValue(option) === this.selectedValue;
  }

  /**
   * @description Returns the `value` attribute of the selected option element
   */
  get selectedValue(): string {
    return this.container.value;
  }
}

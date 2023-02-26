import BaseSelection from './base_selection';
import { dispatchEvent } from './utils';

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
    this.input.value = '';
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
   * @description Sets the value attribute on the `auto-complete` element. Additionally, it also tries to find the
   * option based on the provided value. If an option is found, `data-label` attribute is set on the `auto-complete`
   * element, else removed
   */
  setValue(value: string) {
    this.container.value = value;
    const option = this.autocomplete.options.find((o) => this.getValue(o) === value);
    this.container.label = option ? this.getLabel(option) : '';
  }

  /**
   * @description Removes the value and label attribute from the `auto-complete` element
   */
  removeValue() {
    this.container.value = '';
    this.container.label = '';
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

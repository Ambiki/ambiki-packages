import { expect, fixture, html } from '@open-wc/testing';
import { triggerEvent, find, findAll } from '@ambiki/test-utils';
import type AutoCompleteElement from '../src/element';

export async function openList(input: HTMLInputElement) {
  await triggerEvent(input, 'mousedown');
}

export function expectInputLinkedWithOption(input: HTMLInputElement, option: HTMLElement) {
  expect(option).to.have.attribute('data-active');
  expect(input).to.have.attribute('aria-activedescendant', option.id);
}

export function expectEventArgs(
  eventHandler: sinon.SinonSpy,
  { option, value, label }: { option: HTMLElement; value: string | number; label: string }
) {
  expect(eventHandler.args[0][0].detail.option).to.eq(option);
  expect(eventHandler.args[0][0].detail.value).to.eq(value);
  expect(eventHandler.args[0][0].detail.label).to.eq(label);
}

export type SetupFixtureProps = {
  options: Array<{
    id: number;
    value?: number | string;
    label?: string;
    text?: string;
    disabled?: boolean;
    hidden?: boolean;
  }>;
  name?: string;
  value?: string | string[] | number | number[];
  label?: string;
  multiple?: boolean;
  clearable?: boolean;
  form?: boolean;
  disabled?: boolean;
};

export async function setupFixture({
  options,
  name,
  value,
  label = '',
  multiple = false,
  clearable = false,
  form = false,
  disabled = false,
}: SetupFixtureProps) {
  const _value = Array.isArray(value) ? JSON.stringify(value) : value;

  const autoComplete = html`
    <auto-complete
      for="list"
      ?multiple=${multiple}
      name=${typeof name === 'undefined' ? undefined : name}
      .value=${typeof _value === 'undefined' ? undefined : _value}
      data-label=${typeof label === 'undefined' ? undefined : label}
      ?disabled=${disabled}
    >
      >
      <input type="text" />
      ${clearable && html`<button type="button" data-clear>X</button>`}
      <ul id="list">
        ${options.map(
          (option) =>
            html`<li
              value="${option.value || option.id}"
              data-label="${option.label || 'Option'}"
              role="option"
              id="${option.id}"
              aria-disabled="${option.disabled ? 'true' : 'false'}"
              ?disabled="${option.disabled}"
              ?hidden="${option.hidden}"
            >
              ${option.text || 'Option'}
            </li>`
        )}
      </ul>
    </auto-complete>
  `;

  if (form) {
    await fixture(html`<form action="#">${autoComplete}<button type="reset">Reset button</button></form>`);
  } else {
    await fixture(autoComplete);
  }

  return {
    form: find<HTMLFormElement>('form'),
    container: find<AutoCompleteElement>('auto-complete'),
    input: find<HTMLInputElement>('input'),
    list: find('ul'),
    options: findAll('li[role="option"]'),
    clearBtn: find<HTMLButtonElement>('button[data-clear]'),
    resetBtn: find<HTMLButtonElement>('button[type="reset"]'),
  };
}

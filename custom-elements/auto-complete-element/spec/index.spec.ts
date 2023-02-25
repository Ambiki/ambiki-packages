import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { fillIn, find, findAll, triggerEvent, triggerKeyEvent } from '@ambiki/test-utils';
import { nextTick } from '@ambiki/utils';
import * as sinon from 'sinon';
import '../src';
import AutoCompleteElement from '../src';

describe('AutoCompleteElement', () => {
  it('adds attributes after initializing', async () => {
    const { input, list, clearBtn } = await setupFixture({ options: [{ id: 1 }], clearable: true });

    expect(input).to.have.attribute('spellcheck', 'false');
    expect(input).to.have.attribute('autocomplete', 'off');
    expect(list).to.have.attribute('tabindex', '-1');
    expect(list).to.have.attribute('aria-orientation', 'vertical');
    expect(clearBtn).to.have.attribute('aria-label');
  });

  it('adds attributes after opening the list', async () => {
    const { input, list } = await setupFixture({ options: [{ id: 1 }] });
    await triggerEvent(input, 'pointerdown');

    expect(input).not.to.have.attribute('data-empty');
    expect(list.hidden).to.be.false;
  });

  it('activates the first option after opening the list', async () => {
    const { input, list, options } = await setupFixture({ options: [{ id: 1 }] });
    await triggerEvent(input, 'pointerdown');

    expect(list.hidden).to.be.false;
    expectInputLinkedWithOption(input, options[0]);
  });

  it('activates the selected option after opening the list', async () => {
    const { input, list, options } = await setupFixture({ options: [{ id: 1 }, { id: 2 }], value: 2 });
    await triggerEvent(input, 'pointerdown');

    expect(list.hidden).to.be.false;
    expectInputLinkedWithOption(input, options[1]);
  });

  it('adds data-empty attribute if there are no options', async () => {
    const { input, list } = await setupFixture({ options: [] });
    await triggerEvent(input, 'pointerdown');

    expect(list.hidden).to.be.false;
    expect(list).to.have.attribute('data-empty');
  });

  it('destroys the options after closing the list', async () => {
    const { input, list, options } = await setupFixture({ options: [{ id: 1 }, { id: 2 }], value: 2 });
    await triggerEvent(input, 'pointerdown');

    expect(options[1]).to.have.attribute('aria-selected', 'true');
    expect(options[1]).to.have.attribute('data-active');
    await triggerEvent(input, 'blur');

    expect(list.hidden).to.be.true;
    expect(options[1]).to.have.attribute('aria-selected', 'false');
    expect(options[1]).not.to.have.attribute('data-active');
  });

  it('does not select if the option is disabled', async () => {
    const { input, list, options, container } = await setupFixture({ options: [{ id: 1, disabled: true }] });
    const commitHandler = sinon.spy();
    const selectHandler = sinon.spy();
    container.addEventListener('auto-complete:commit', commitHandler);
    container.addEventListener('auto-complete:select', selectHandler);

    await triggerEvent(input, 'pointerdown');
    expect(list.hidden).to.be.false;

    options[0].click();
    expect(container).not.to.have.attribute('value');
    expect(commitHandler.called).to.be.false;
    expect(selectHandler.called).to.be.false;
  });

  it('selects the option on Enter/Tab key', async () => {
    const { input, list, options, container } = await setupFixture({
      options: [
        { id: 1, value: 'foo', label: 'Foo' },
        { id: 2, value: 'bar', label: 'Bar' },
      ],
    });
    const commitHandler = sinon.spy();
    const selectHandler = sinon.spy();
    container.addEventListener('auto-complete:commit', commitHandler);
    container.addEventListener('auto-complete:select', selectHandler);

    await triggerEvent(input, 'pointerdown');
    expect(list.hidden).to.be.false;
    await triggerKeyEvent(input, 'keydown', { key: 'Enter' });

    expect(container.value).to.eq(options[0].getAttribute('value'));
    expect(commitHandler.calledOnce).to.be.true;
    expectEventArgs(commitHandler, { option: options[0], value: 'foo', label: 'Foo' });
    expect(selectHandler.calledOnce).to.be.true;
    expectEventArgs(selectHandler, { option: options[0], value: 'foo', label: 'Foo' });
    expect(commitHandler.calledAfter(selectHandler)).to.be.true;

    await triggerEvent(input, 'pointerdown');
    expect(list.hidden).to.be.false;
    await triggerKeyEvent(input, 'keydown', { key: 'ArrowDown' });
    expectInputLinkedWithOption(input, options[1]);
    await triggerKeyEvent(input, 'keydown', { key: 'Tab' });

    expect(container.value).to.eq(options[1].getAttribute('value'));
    expect(commitHandler.called).to.be.true;
    expect(selectHandler.called).to.be.true;
    expect(commitHandler.calledAfter(selectHandler)).to.be.true;
  });

  it('closes the list on Escape key', async () => {
    const { input, list } = await setupFixture({ options: [{ id: 1 }] });

    await triggerEvent(input, 'pointerdown');
    expect(list.hidden).to.be.false;

    await triggerKeyEvent(input, 'keydown', { key: 'Escape' });
    expect(list.hidden).to.be.true;
  });

  it('opens the list on Alt+ArrowDown', async () => {
    const { input, list } = await setupFixture({ options: [{ id: 1 }] });

    await triggerKeyEvent(input, 'keydown', { key: 'ArrowDown', altKey: true });
    expect(list.hidden).to.be.false;
  });

  it('closes the list on Alt+ArrowUp', async () => {
    const { input, list } = await setupFixture({ options: [{ id: 1 }] });

    await triggerEvent(input, 'pointerdown');
    expect(list.hidden).to.be.false;

    await triggerKeyEvent(input, 'keydown', { key: 'ArrowUp', altKey: true });
    expect(list.hidden).to.be.true;
  });

  it('dispatches events when showing the list', async () => {
    const { input, list, container } = await setupFixture({ options: [{ id: 1 }] });
    const showHandler = sinon.spy();
    const shownHandler = sinon.spy();
    container.addEventListener('auto-complete:show', showHandler);
    container.addEventListener('auto-complete:shown', shownHandler);

    await triggerEvent(input, 'pointerdown');
    expect(list.hidden).to.be.false;

    expect(showHandler.calledOnce).to.be.true;
    expect(shownHandler.calledOnce).to.be.true;
    expect(shownHandler.calledAfter(showHandler)).to.be.true;
  });

  it('dispatches events when hiding the list', async () => {
    const { input, list, container } = await setupFixture({ options: [{ id: 1 }] });
    const hideHandler = sinon.spy();
    const hiddenHandler = sinon.spy();
    container.addEventListener('auto-complete:hide', hideHandler);
    container.addEventListener('auto-complete:hidden', hiddenHandler);

    await triggerEvent(input, 'pointerdown');
    expect(list.hidden).to.be.false;

    await triggerEvent(input, 'blur');
    expect(list.hidden).to.be.true;

    expect(hideHandler.calledOnce).to.be.true;
    expect(hiddenHandler.calledOnce).to.be.true;
    expect(hiddenHandler.calledAfter(hideHandler)).to.be.true;
  });

  it('filters the options', async () => {
    const { input, list, options } = await setupFixture({
      options: [
        { id: 1, label: 'Hero' },
        { id: 2, label: 'Mauri' },
      ],
    });
    await triggerEvent(input, 'pointerdown');
    expect(list.hidden).to.be.false;

    await fillIn(input, 'hero');
    await waitUntil(() => options[1].hidden); // search is debounced
    expect(options[1].hidden).to.be.true;
    expect(options[0].hidden).to.be.false;
  });

  describe('when single-select', () => {
    it('sets aria-selected="true" on the option that matches the value', async () => {
      const { input, list, options } = await setupFixture({ options: [{ id: 1 }, { id: 2 }], value: 2 });
      await triggerEvent(input, 'pointerdown');

      expect(list.hidden).to.be.false;
      expect(options[1]).to.have.attribute('aria-selected', 'true');
    });

    it('selects an option', async () => {
      const { input, list, options, container } = await setupFixture({
        options: [{ id: 1, label: 'Hero' }, { id: 2 }],
      });

      await triggerEvent(input, 'pointerdown');
      expect(list.hidden).to.be.false;

      options[0].click();
      expect(container.value).to.eq(options[0].getAttribute('value'));
      expect(container.label).to.eq(options[0].getAttribute('data-label'));
      expect(input.value).to.eq('Hero');
      expect(list.hidden).to.be.true;

      await triggerEvent(input, 'pointerdown');
      expect(list.hidden).to.be.false;
      expect(options[0]).to.have.attribute('aria-selected', 'true');
    });

    it('sets input value if label is present', async () => {
      const { input } = await setupFixture({
        options: [{ id: 1, value: 100, label: 'My option' }, { id: 2 }],
        value: 100,
      });

      expect(input.value).to.eq('My option');
    });

    it('clears the selected value when clearBtn is clicked', async () => {
      const { input, list, container, clearBtn } = await setupFixture({
        options: [{ id: 1, value: 1, label: 'Hero' }, { id: 2 }],
        value: 1,
        clearable: true,
      });

      const clearHandler = sinon.spy();
      container.addEventListener('auto-complete:clear', clearHandler);

      expect(container).to.have.attribute('value');
      expect(input.value).to.eq('Hero');
      await triggerEvent(input, 'pointerdown');
      expect(list.hidden).to.be.false;

      clearBtn.click();
      expect(list.hidden).to.be.true;
      expect(document.activeElement === input).to.be.true;
      expect(container).not.to.have.attribute('value');
      expect(input.value).to.eq('');
      expect(clearHandler.calledOnce).to.be.true;
    });
  });

  describe('when multi-select', () => {
    it('sets aria-selected="true" on all the options that matches the value', async () => {
      const { input, list, options } = await setupFixture({
        options: [{ id: 1 }, { id: 2 }, { id: 3 }],
        value: [1, 2],
        multiple: true,
      });
      await triggerEvent(input, 'pointerdown');

      expect(list.hidden).to.be.false;
      expect(options[0]).to.have.attribute('aria-selected', 'true');
      expect(options[1]).to.have.attribute('aria-selected', 'true');
      expect(options[2]).to.have.attribute('aria-selected', 'false');
    });

    it('selects options', async () => {
      const { input, list, options, container } = await setupFixture({
        options: [{ id: 1 }, { id: 2 }],
        multiple: true,
      });
      await triggerEvent(input, 'pointerdown');
      expect(list.hidden).to.be.false;

      options[0].click();
      expect(JSON.parse(container.value)).to.eql([options[0].getAttribute('value')]);
      expect(list.hidden).to.be.false;

      options[1].click();
      expect(JSON.parse(container.value)).to.eql([options[0].getAttribute('value'), options[1].getAttribute('value')]);

      await triggerEvent(input, 'blur');
      expect(list.hidden).to.be.true;
      await triggerEvent(input, 'pointerdown');
      expect(options[0]).to.have.attribute('aria-selected', 'true');
      expect(options[1]).to.have.attribute('aria-selected', 'true');

      options[0].click();
      expect(JSON.parse(container.value)).to.eql([options[1].getAttribute('value')]);

      options[1].click();
      expect(container).not.to.have.attribute('value');
    });

    it('deselects the option on Enter key', async () => {
      const { input, list, container, options } = await setupFixture({
        options: [{ id: 1, value: 'foo', label: 'Foo' }],
        value: ['foo'],
        multiple: true,
      });
      const commitHandler = sinon.spy();
      const deselectHandler = sinon.spy();
      container.addEventListener('auto-complete:commit', commitHandler);
      container.addEventListener('auto-complete:deselect', deselectHandler);

      await triggerEvent(input, 'pointerdown');
      expect(list.hidden).to.be.false;
      await triggerKeyEvent(input, 'keydown', { key: 'Enter' });

      expect(container).not.to.have.attribute('value');
      await nextTick();
      expect(commitHandler.calledOnce).to.be.true;
      expectEventArgs(commitHandler, { option: options[0], value: 'foo', label: 'Foo' });
      expect(deselectHandler.calledOnce).to.be.true;
      expectEventArgs(deselectHandler, { option: options[0], value: 'foo', label: 'Foo' });
      expect(commitHandler.calledAfter(deselectHandler)).to.be.true;
    });

    it('deselects the option on Tab key', async () => {
      const { input, list, container, options } = await setupFixture({
        options: [{ id: 1, value: 'foo', label: 'Foo' }],
        value: ['foo'],
        multiple: true,
      });
      const commitHandler = sinon.spy();
      const deselectHandler = sinon.spy();
      container.addEventListener('auto-complete:commit', commitHandler);
      container.addEventListener('auto-complete:deselect', deselectHandler);

      await triggerEvent(input, 'pointerdown');
      expect(list.hidden).to.be.false;
      await triggerKeyEvent(input, 'keydown', { key: 'Tab' });

      expect(container).not.to.have.attribute('value');
      await nextTick();
      expect(commitHandler.calledOnce).to.be.true;
      expectEventArgs(commitHandler, { option: options[0], value: 'foo', label: 'Foo' });
      expect(deselectHandler.calledOnce).to.be.true;
      expectEventArgs(deselectHandler, { option: options[0], value: 'foo', label: 'Foo' });
      expect(commitHandler.calledAfter(deselectHandler)).to.be.true;
    });

    it('clears the input field after committing', async () => {
      const { input, options } = await setupFixture({ options: [{ id: 1 }], multiple: true });
      await fillIn(input, 'search text');
      expect(input.value).to.eq('search text');

      await triggerEvent(input, 'pointerdown');
      options[0].click();
      expect(input.value).to.eq('');
    });

    it('sets data-active after committing an option', async () => {
      const { input, list, options } = await setupFixture({
        options: [{ id: 1 }, { id: 2 }],
        value: [1],
        multiple: true,
      });

      await triggerEvent(input, 'pointerdown');
      expect(list.hidden).to.be.false;
      options[1].click();
      await waitUntil(() => options[1].hasAttribute('data-active'));
      expect(options[0]).not.to.have.attribute('data-active');
      expect(options[1]).to.have.attribute('data-active');

      options[0].click();
      await waitUntil(() => options[0].hasAttribute('data-active'));
      expect(options[0]).to.have.attribute('data-active');
      expect(options[1]).not.to.have.attribute('data-active');
    });

    it('clears the selected values when clearBtn is clicked', async () => {
      const { input, list, container, clearBtn } = await setupFixture({
        options: [{ id: 1 }, { id: 2 }],
        value: [1, 2],
        clearable: true,
      });

      const clearHandler = sinon.spy();
      container.addEventListener('auto-complete:clear', clearHandler);

      expect(container).to.have.attribute('value');
      await triggerEvent(input, 'pointerdown');
      expect(list.hidden).to.be.false;

      clearBtn.click();
      expect(list.hidden).to.be.true;
      expect(document.activeElement === input).to.be.true;
      expect(container).not.to.have.attribute('value');
      expect(clearHandler.calledOnce).to.be.true;
    });
  });
});

function expectInputLinkedWithOption(input: HTMLInputElement, option: HTMLElement) {
  expect(option).to.have.attribute('data-active');
  expect(input).to.have.attribute('aria-activedescendant', option.id);
}

function expectEventArgs(
  eventHandler: sinon.SinonSpy,
  { option, value, label }: { option: HTMLElement; value: string | number; label: string }
) {
  expect(eventHandler.args[0][0].detail.option).to.eq(option);
  expect(eventHandler.args[0][0].detail.value).to.eq(value);
  expect(eventHandler.args[0][0].detail.label).to.eq(label);
}

type SetupFixtureProps = {
  options: Array<{
    id: number;
    value?: number | string;
    label?: string;
    text?: string;
    disabled?: boolean;
    hidden?: boolean;
  }>;
  value?: string | string[] | number | number[];
  multiple?: boolean;
  clearable?: boolean;
};

async function setupFixture({ options, value, multiple = false, clearable = false }: SetupFixtureProps) {
  const _value = Array.isArray(value) ? JSON.stringify(value) : value;
  const selectedOption = options.find((o) => o.value === value);
  const _label = multiple ? undefined : selectedOption?.label;

  await fixture(html`
    <auto-complete
      for="list"
      ?multiple="${multiple}"
      .value="${typeof _value === 'undefined' ? undefined : _value}"
      data-label="${typeof _label === 'undefined' ? undefined : _label}"
    >
      <input type="text" />
      ${clearable && html`<button type="button" data-clear>X</button>`}
      <ul id="list" hidden>
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
  `);

  return {
    container: find<AutoCompleteElement>('auto-complete'),
    input: find<HTMLInputElement>('input'),
    list: find('ul'),
    options: findAll('li[role="option"]'),
    clearBtn: find('button[data-clear]'),
  };
}

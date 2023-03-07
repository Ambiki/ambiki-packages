import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { fillIn, find, findAll, triggerEvent, triggerKeyEvent } from '@ambiki/test-utils';
import { nextTick } from '@ambiki/utils';
import * as sinon from 'sinon';
import '../src';
import type AutoCompleteElement from '../src';

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
    await openList(input);

    expect(input).not.to.have.attribute('data-empty');
    expect(list.hidden).to.be.false;
  });

  it('activates the first option after opening the list', async () => {
    const { input, list, options } = await setupFixture({ options: [{ id: 1 }] });
    await openList(input);

    expect(list.hidden).to.be.false;
    expectInputLinkedWithOption(input, options[0]);
  });

  it('activates the selected option after opening the list', async () => {
    const { input, list, options } = await setupFixture({ options: [{ id: 1 }, { id: 2 }], value: 2 });
    await openList(input);

    expect(list.hidden).to.be.false;
    expectInputLinkedWithOption(input, options[1]);
  });

  it('adds data-empty attribute if there are no options', async () => {
    const { input, list } = await setupFixture({ options: [] });
    await openList(input);

    expect(list.hidden).to.be.false;
    expect(list).to.have.attribute('data-empty');
  });

  it('destroys the options after closing the list', async () => {
    const { input, list, options } = await setupFixture({ options: [{ id: 1 }, { id: 2 }], value: 2 });
    await openList(input);

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

    await openList(input);
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

    await openList(input);
    expect(list.hidden).to.be.false;
    await triggerKeyEvent(input, 'keydown', { key: 'Enter' });

    expect(container.value).to.eq(options[0].getAttribute('value'));
    expect(commitHandler.calledOnce).to.be.true;
    expectEventArgs(commitHandler, { option: options[0], value: 'foo', label: 'Foo' });
    expect(selectHandler.calledOnce).to.be.true;
    expectEventArgs(selectHandler, { option: options[0], value: 'foo', label: 'Foo' });
    expect(commitHandler.calledAfter(selectHandler)).to.be.true;

    await openList(input);
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

    await openList(input);
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

    await openList(input);
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

    await openList(input);
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

    await openList(input);
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
    await openList(input);
    expect(list.hidden).to.be.false;

    await fillIn(input, 'hero');
    await waitUntil(() => options[1].hidden); // search is debounced
    expect(options[1].hidden).to.be.true;
    expect(options[0].hidden).to.be.false;
  });

  describe('#deactivate', () => {
    it('removes the data-active attribute from the option element', async () => {
      const { input, options, container } = await setupFixture({ options: [{ id: 1 }, { id: 2 }] });

      await openList(input);
      expect(options[0]).to.have.attribute('data-active');

      container.autocomplete?.deactivate();
      expect(find('[data-active]')).not.to.exist;
    });
  });

  describe('when single-select', () => {
    it('sets the input value and the data-label attribute from the value', async () => {
      const { input, options, container } = await setupFixture({
        options: [{ id: 1 }, { id: 2, label: 'Foo', value: 'foo' }],
        value: 'foo',
      });

      expect(container.label).to.eq('Foo');
      expect(input.value).to.eq('Foo');
      expect(container.value).to.eq('foo');
      expect(options[0]).not.to.have.attribute('aria-selected', 'true'); // We only want a checked state after opening the list
    });

    it('sets the input value and the data-label attribute from the data-label attribute', async () => {
      const { input, container } = await setupFixture({
        options: [{ id: 1 }, { id: 2, label: 'Foo', value: 'foo' }],
        value: 'foo',
        label: 'Foobar', // This is different than the `value` of the selected option. Testing if it can override it.
      });

      expect(container.label).to.eq('Foobar');
      expect(input.value).to.eq('Foobar');
      expect(container.value).to.eq('foo');
    });

    it('sets aria-selected="true" on the option that matches the value', async () => {
      const { input, list, options } = await setupFixture({
        options: [{ id: 1 }, { id: 2, value: 'foo' }],
        value: 'foo',
      });
      await openList(input);

      expect(list.hidden).to.be.false;
      expect(options[1]).to.have.attribute('aria-selected', 'true');
    });

    describe('when name attribute is present', () => {
      it('appends hidden input field with value', async () => {
        await setupFixture({
          options: [{ id: 1 }, { id: 2, value: 'foo' }],
          value: 'foo',
          name: 'event[creator_id]',
        });

        const hiddenInput = find('input[type="hidden"]');
        expect(hiddenInput).to.exist;
        expect(hiddenInput).to.have.attribute('name', 'event[creator_id]');
        expect(hiddenInput).to.have.attribute('value', 'foo');
      });

      it('appends hidden input field without value', async () => {
        await setupFixture({
          options: [{ id: 1 }, { id: 2, value: 'foo' }],
          name: 'event[creator_id]',
        });

        const hiddenInput = find('input[type="hidden"]');
        expect(hiddenInput).to.exist;
        expect(hiddenInput).to.have.attribute('name', 'event[creator_id]');
        expect(hiddenInput).to.have.attribute('value', '');
      });

      it('updates value after selecting an option', async () => {
        const { input, list, options } = await setupFixture({
          options: [
            { id: 1, value: 'foo' },
            { id: 2, value: 'bar' },
          ],
          name: 'event[creator_id]',
        });

        const hiddenInput = find('input[type="hidden"]');
        expect(hiddenInput).to.have.attribute('value', '');

        await openList(input);
        expect(list.hidden).to.be.false;

        options[1].click();
        expect(hiddenInput).to.have.attribute('value', 'bar');
      });

      it('clears the value after clearBtn is clicked', async () => {
        const { clearBtn } = await setupFixture({
          options: [{ id: 1, value: 1, label: 'Hero' }, { id: 2 }],
          value: 1,
          name: 'event[creator_id]',
          clearable: true,
        });

        const hiddenInput = find('input[type="hidden"]');
        expect(hiddenInput).to.have.attribute('value', '1');

        clearBtn.click();
        expect(hiddenInput).to.have.attribute('value', '');
      });
    });

    it('selects an option', async () => {
      const { input, list, options, container } = await setupFixture({
        options: [{ id: 1, label: 'Hero' }, { id: 2 }],
      });

      await openList(input);
      expect(list.hidden).to.be.false;

      options[0].click();
      expect(container.value).to.eq(options[0].getAttribute('value'));
      expect(container.label).to.eq(options[0].getAttribute('data-label'));
      expect(input.value).to.eq('Hero');
      expect(list.hidden).to.be.true;

      await openList(input);
      expect(list.hidden).to.be.false;
      expect(options[0]).to.have.attribute('aria-selected', 'true');
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
      await openList(input);
      expect(list.hidden).to.be.false;

      clearBtn.click();
      expect(list.hidden).to.be.true;
      expect(document.activeElement === input).to.be.true;
      expect(container).not.to.have.attribute('value');
      expect(input.value).to.eq('');
      expect(clearHandler.calledOnce).to.be.true;
    });

    describe('#setValue', () => {
      it('sets the value but does not select the option if the list is hidden', async () => {
        const { container, input, options } = await setupFixture({ options: [{ id: 1, value: 'foo', label: 'Foo' }] });
        container.autocomplete?.setValue([{ value: 'foo' }]);

        expect(container.value).to.eq('foo');
        expect(container.label).to.eq('Foo');
        expect(input.value).to.eq('Foo');
        expect(options[0]).not.to.have.attribute('aria-selected', 'true');
      });

      it('sets the value and selects the option if list is open', async () => {
        const { input, container, list, options } = await setupFixture({
          options: [{ id: 1, value: 'foo', label: 'Foo' }],
        });

        await openList(input);
        expect(list.hidden).to.be.false;
        expect(options[0]).to.have.attribute('aria-selected', 'false');

        container.autocomplete?.setValue([{ value: 'foo' }]);
        expect(container.value).to.eq('foo');
        expect(container.label).to.eq('Foo');
        expect(input.value).to.eq('Foo');
        expect(options[0]).to.have.attribute('aria-selected', 'true');
      });

      it('sets the value and the label from the params', async () => {
        const { input, container } = await setupFixture({ options: [] });
        // Only selects the first object because it's a single-select
        container.autocomplete?.setValue([
          { value: 'foo', label: 'Foo' },
          { value: 'bar', label: 'Baz' },
        ]);

        expect(container.value).to.eq('foo');
        expect(container.label).to.eq('Foo');
        expect(input.value).to.eq('Foo');
      });

      it('removes the `data-label` attribute if label cannot be determined', async () => {
        const { input, container } = await setupFixture({ options: [] });
        container.autocomplete?.setValue([{ value: 'foo' }]);

        expect(container.value).to.eq('foo');
        expect(container).not.to.have.attribute('data-label');
        expect(input.value).to.eq('');
      });

      it('clears the value', async () => {
        const { input, container, options } = await setupFixture({
          options: [{ id: 1, value: 'foo', label: 'Foo' }],
          value: 'foo',
        });
        await openList(input);
        container.autocomplete?.setValue([]);

        expect(container.value).to.eq('');
        expect(container.label).to.eq('');
        expect(input.value).to.eq('');
        expect(options[0]).not.to.have.attribute('aria-selected', 'true');
      });
    });

    describe('#removeValue', () => {
      it('removes a value and updates the selected state', async () => {
        const { input, container, options } = await setupFixture({
          options: [{ id: 1, value: 'foo', label: 'Foo' }],
          value: 'foo',
        });
        expect(container.value).to.eq('foo');
        expect(container.label).to.eq('Foo');
        expect(input.value).to.eq('Foo');

        await openList(input);
        expect(options[0]).to.have.attribute('aria-selected', 'true');

        container.autocomplete?.removeValue('foo');
        expect(container).not.to.have.attribute('value');
        expect(container).not.to.have.attribute('data-label');
        expect(input.value).to.eq('');
        expect(options[0]).to.have.attribute('aria-selected', 'false');
      });
    });
  });

  describe('when multi-select', () => {
    it('sets aria-selected="true" on all the options that matches the value', async () => {
      const { input, list, options } = await setupFixture({
        options: [{ id: 1 }, { id: 2 }, { id: 3 }],
        value: [1, 2],
        multiple: true,
      });
      await openList(input);

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
      await openList(input);
      expect(list.hidden).to.be.false;

      options[0].click();
      expect(JSON.parse(container.value)).to.eql([options[0].getAttribute('value')]);
      expect(list.hidden).to.be.false;

      options[1].click();
      expect(JSON.parse(container.value)).to.eql([options[0].getAttribute('value'), options[1].getAttribute('value')]);

      await triggerEvent(input, 'blur');
      expect(list.hidden).to.be.true;
      await openList(input);
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

      await openList(input);
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

      await openList(input);
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

      await openList(input);
      options[0].click();
      expect(input.value).to.eq('');
    });

    it('sets data-active after committing an option', async () => {
      const { input, list, options } = await setupFixture({
        options: [{ id: 1 }, { id: 2 }],
        value: [1],
        multiple: true,
      });

      await openList(input);
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
      await openList(input);
      expect(list.hidden).to.be.false;

      clearBtn.click();
      expect(list.hidden).to.be.true;
      expect(document.activeElement === input).to.be.true;
      expect(container).not.to.have.attribute('value');
      expect(clearHandler.calledOnce).to.be.true;
    });

    describe('#setValue', () => {
      it('sets the value but does not select the option if the list is hidden', async () => {
        const { container, options } = await setupFixture({
          options: [{ id: 1, value: 'foo' }],
          multiple: true,
        });
        container.autocomplete?.setValue([{ value: 'foo' }]);

        expect(JSON.parse(container.value)).to.eql(['foo']);
        expect(container.label).to.eq('');
        expect(options[0]).not.to.have.attribute('aria-selected', 'true');
      });

      it('sets the value and selects the option if list is open', async () => {
        const { input, container, list, options } = await setupFixture({
          options: [{ id: 1, value: 'foo' }],
          multiple: true,
        });

        await openList(input);
        expect(list.hidden).to.be.false;
        expect(options[0]).to.have.attribute('aria-selected', 'false');

        container.autocomplete?.setValue([{ value: 'foo' }]);
        expect(JSON.parse(container.value)).to.eql(['foo']);
        expect(options[0]).to.have.attribute('aria-selected', 'true');
      });

      it('does not set duplicate values', async () => {
        const { container } = await setupFixture({
          options: [{ id: 1, value: 'foo' }],
          multiple: true,
        });
        container.autocomplete?.setValue([{ value: 'foo' }, { value: 'foo' }]);

        expect(JSON.parse(container.value)).to.eql(['foo']);
      });

      it('clears the value', async () => {
        const { input, container, options } = await setupFixture({
          options: [{ id: 1, value: 'foo', label: 'Foo' }],
          value: ['foo'],
          multiple: true,
        });
        await openList(input);
        container.autocomplete?.setValue([]);

        expect(container).not.to.have.attribute('value');
        expect(input.value).to.eq('');
        expect(options[0]).not.to.have.attribute('aria-selected', 'true');
      });
    });

    describe('#removeValue', () => {
      it('removes a value and updates the selected state', async () => {
        const { input, container, options } = await setupFixture({
          options: [
            { id: 1, value: 'foo', label: 'Foo' },
            { id: 2, value: 'bar', label: 'Baz' },
          ],
          value: ['foo', 'bar'],
          multiple: true,
        });
        expect(JSON.parse(container.value)).to.eql(['foo', 'bar']);

        await openList(input);
        expect(options[0]).to.have.attribute('aria-selected', 'true');
        expect(options[1]).to.have.attribute('aria-selected', 'true');

        container.autocomplete?.removeValue('foo');
        expect(JSON.parse(container.value)).to.eql(['bar']);
        expect(options[0]).to.have.attribute('aria-selected', 'false');
        expect(options[1]).to.have.attribute('aria-selected', 'true');
      });
    });
  });
});

async function openList(input: HTMLInputElement) {
  await triggerEvent(input, 'mousedown');
}

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
  name?: string;
  value?: string | string[] | number | number[];
  label?: string;
  multiple?: boolean;
  clearable?: boolean;
};

async function setupFixture({
  options,
  name,
  value,
  label = '',
  multiple = false,
  clearable = false,
}: SetupFixtureProps) {
  const _value = Array.isArray(value) ? JSON.stringify(value) : value;

  await fixture(html`
    <auto-complete
      for="list"
      ?multiple="${multiple}"
      .name="${typeof name === 'undefined' ? undefined : name}"
      .value="${typeof _value === 'undefined' ? undefined : _value}"
      data-label="${typeof label === 'undefined' ? undefined : label}"
    >
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

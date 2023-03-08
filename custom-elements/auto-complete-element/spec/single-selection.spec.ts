import { expect } from '@open-wc/testing';
import { find } from '@ambiki/test-utils';
import * as sinon from 'sinon';
import '../src';
import { setupFixture, openList } from './utils';

describe('Single-selection', () => {
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

  describe('selecting an option', () => {
    it('sets the input value and the data-label attribute', async () => {
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

      // Input field with name attribute should not exist
      expect(find('input[name]')).not.to.exist;
    });

    it('updates the hidden field value', async () => {
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
  });

  describe('clearing auto-complete', () => {
    it('clears the selected value', async () => {
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

    it('clears the hidden field value', async () => {
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

  describe('#setValue', () => {
    it('sets the value but does not select the option if the list is hidden', async () => {
      const { container, input, options } = await setupFixture({ options: [{ id: 1, value: 'foo', label: 'Foo' }] });
      container.autocomplete?.setValue([{ value: 'foo' }]);

      expect(container.value).to.eq('foo');
      expect(container.label).to.eq('Foo');
      expect(input.value).to.eq('Foo');
      expect(options[0]).not.to.have.attribute('aria-selected', 'true');

      // Input field with name attribute should not exist
      expect(find('input[name]')).not.to.exist;
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

      // Input field with name attribute should not exist
      expect(find('input[name]')).not.to.exist;
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

      // Input field with name attribute should not exist
      expect(find('input[name]')).not.to.exist;
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

    it('updates the hidden field value', async () => {
      const { container } = await setupFixture({
        options: [
          { id: 1, value: 'foo', label: 'Foo' },
          { id: 2, value: 'bar', label: 'Bar' },
        ],
        value: 'foo',
        name: 'event[creator_id]',
      });

      expect(find<HTMLInputElement>('input[type="hidden"][name="event[creator_id]"]').value).to.eq('foo');

      container.autocomplete?.setValue([{ value: 'bar' }]);
      expect(find<HTMLInputElement>('input[type="hidden"][name="event[creator_id]"]').value).to.eq('bar');

      container.autocomplete?.setValue([]);
      expect(find<HTMLInputElement>('input[type="hidden"][name="event[creator_id]"]').value).to.eq('');
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

      // Input field with name attribute should not exist
      expect(find('input[name]')).not.to.exist;
    });

    it('removes the hidden field value', async () => {
      const { container } = await setupFixture({
        options: [
          { id: 1, value: 'foo', label: 'Foo' },
          { id: 2, value: 'bar', label: 'Bar' },
        ],
        value: 'foo',
        name: 'event[creator_id]',
      });

      expect(find<HTMLInputElement>('input[type="hidden"][name="event[creator_id]"]').value).to.eq('foo');

      container.autocomplete?.removeValue('foo');
      expect(find<HTMLInputElement>('input[type="hidden"][name="event[creator_id]"]').value).to.eq('');
    });
  });
});

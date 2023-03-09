import { expect, waitUntil } from '@open-wc/testing';
import { find, findAll, fillIn, triggerEvent, triggerKeyEvent } from '@ambiki/test-utils';
import { nextTick } from '@ambiki/utils';
import * as sinon from 'sinon';
import '../src';
import { setupFixture, openList, expectEventArgs } from './utils';

describe('Multi-selection', () => {
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

    // Input field with name attribute should not exist
    expect(find('input[name]')).not.to.exist;
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

    // Input field with name attribute should not exist
    expect(find('input[name]')).not.to.exist;
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

    // Input field with name attribute should not exist
    expect(find('input[name]')).not.to.exist;
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

  it('appends base hidden input field with empty value', async () => {
    await setupFixture({
      options: [
        { id: 1, value: 'foo' },
        { id: 2, value: 'bar' },
      ],
      name: 'event[creator_ids][]',
      multiple: true,
    });

    const hiddenInput = find('input[type="hidden"]');
    expect(hiddenInput).to.exist;
    expect(hiddenInput).to.have.attribute('name', 'event[creator_ids][]');
    expect(hiddenInput).to.have.attribute('value', '');

    expect(find('input[type="hidden"][value="foo"]')).not.to.exist;
    expect(find('input[type="hidden"][value="bar"]')).not.to.exist;
  });

  it('appends hidden input field with value', async () => {
    await setupFixture({
      options: [
        { id: 1, value: 'foo' },
        { id: 2, value: 'bar' },
      ],
      name: 'event[creator_ids][]',
      value: ['bar', 'foo'],
      multiple: true,
    });

    const baseHiddenInput = find('input[type="hidden"][data-variant="base"]');
    expect(baseHiddenInput).to.exist;
    expect(baseHiddenInput).to.have.attribute('name', 'event[creator_ids][]');
    expect(baseHiddenInput).to.have.attribute('value', '');

    const itemHiddenInput1 = find('input[type="hidden"][value="bar"]');
    expect(itemHiddenInput1).to.exist;
    expect(itemHiddenInput1).to.have.attribute('name', 'event[creator_ids][]');
    expect(itemHiddenInput1).to.have.attribute('value', 'bar');

    const itemHiddenInput2 = find('input[type="hidden"][value="foo"]');
    expect(itemHiddenInput2).to.exist;
    expect(itemHiddenInput2).to.have.attribute('name', 'event[creator_ids][]');
    expect(itemHiddenInput2).to.have.attribute('value', 'foo');
  });

  it('adds/removes hidden input field after selecting an option', async () => {
    const { input, list, options } = await setupFixture({
      options: [
        { id: 1, value: 'foo' },
        { id: 2, value: 'bar' },
      ],
      name: 'event[creator_ids][]',
      multiple: true,
    });

    const baseHiddenInput = find('input[type="hidden"][data-variant="base"]');
    expect(baseHiddenInput).to.exist;
    expect(baseHiddenInput).to.have.attribute('name', 'event[creator_ids][]');
    expect(baseHiddenInput).to.have.attribute('value', '');

    // There aren't any selected values, so there shouldn't be any item hidden inputs.
    expect(findAll('input[type="hidden"][data-variant="item"]').length).to.eq(0);

    await openList(input);
    expect(list.hidden).to.be.false;

    let itemHiddenInput1: HTMLInputElement;

    options[0].click();
    itemHiddenInput1 = find('input[type="hidden"][value="foo"]');
    expect(itemHiddenInput1).to.exist;
    expect(itemHiddenInput1).to.have.attribute('name', 'event[creator_ids][]');
    expect(itemHiddenInput1).to.have.attribute('value', 'foo');

    options[1].click();
    const itemHiddenInput2 = find('input[type="hidden"][value="bar"]');
    expect(itemHiddenInput2).to.exist;
    expect(itemHiddenInput2).to.have.attribute('name', 'event[creator_ids][]');
    expect(itemHiddenInput2).to.have.attribute('value', 'bar');

    // Should remove the hidden input field after deselecting
    options[0].click();
    itemHiddenInput1 = find('input[type="hidden"][value="foo"]');
    expect(itemHiddenInput1).not.to.exist;

    // Base shouldn't have any value
    // See: "Gotcha" section of https://api.rubyonrails.org/classes/ActionView/Helpers/FormOptionsHelper.html#method-i-select
    expect(baseHiddenInput).to.have.attribute('value', '');
  });

  describe('clearing auto-complete', () => {
    it('clears the selected values', async () => {
      const { input, list, container, clearBtn } = await setupFixture({
        options: [{ id: 1 }, { id: 2 }],
        value: [1, 2],
        clearable: true,
        multiple: true,
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

    it('removes the hidden fields', async () => {
      const { clearBtn } = await setupFixture({
        options: [
          { id: 1, value: 'foo' },
          { id: 2, value: 'bar' },
        ],
        value: ['foo', 'bar'],
        name: 'user_ids',
        clearable: true,
        multiple: true,
      });

      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).to.exist;
      expect(findAll('input[data-variant="item"]').length).to.eq(2);

      clearBtn.click();
      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).not.to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).not.to.exist;
      expect(findAll('input[data-variant="item"]').length).to.eq(0);
    });
  });

  describe('form reset', () => {
    it('clears the selected options if there are no options selected initially', async () => {
      const { form, container, input, list, options } = await setupFixture({
        options: [{ id: 1, value: 'foo', label: 'Foo' }],
        form: true,
        multiple: true,
      });

      await openList(input);
      expect(list.hidden).to.be.false;

      options[0].click();
      expect(JSON.parse(container.value)).to.eql(['foo']);
      expect(list.hidden).to.be.false;

      form.reset();
      expect(container).not.to.have.attribute('value');
      expect(input.value).to.eq('');
      await waitUntil(() => list.hidden);
      expect(list.hidden).to.be.true;

      await openList(input);
      options[0].click();
      expect(JSON.parse(container.value)).to.eql(['foo']);

      form.reset();
      expect(container).not.to.have.attribute('value');

      await openList(input);
      expect(findAll('li[role="options"][aria-selected="true"]').length).to.eq(0);
    });

    it('resets the selected options', async () => {
      const { form, container, input, list, options } = await setupFixture({
        options: [
          { id: 1, value: 'foo', label: 'Foo' },
          { id: 2, value: 'bar', label: 'Bar' },
          { id: 3, value: 'baz', label: 'Baz' },
        ],
        value: ['foo'],
        form: true,
        multiple: true,
      });

      expect(JSON.parse(container.value)).to.eql(['foo']);
      expect(input.value).to.eq('');

      await openList(input);
      expect(list.hidden).to.be.false;

      options[1].click();
      expect(JSON.parse(container.value)).to.eql(['foo', 'bar']);

      form.reset();
      expect(JSON.parse(container.value)).to.eql(['foo']);
      expect(input.value).to.eq('');
      await waitUntil(() => list.hidden);
      expect(list.hidden).to.be.true;

      await openList(input);
      options[2].click();
      expect(JSON.parse(container.value)).to.eql(['foo', 'baz']);
      form.reset();
      expect(JSON.parse(container.value)).to.eql(['foo']);
    });

    it('clears the search field', async () => {
      const { form, input } = await setupFixture({
        options: [
          { id: 1, value: 'foo', label: 'Foo' },
          { id: 2, value: 'bar', label: 'Bar' },
        ],
        form: true,
        multiple: true,
      });

      await fillIn(input, 'Foo');
      form.reset();

      expect(input.value).to.eq('');
    });

    it('resets the default values after clearing the auto-complete', async () => {
      const { form, container, clearBtn } = await setupFixture({
        options: [
          { id: 1, value: 'foo', label: 'Foo' },
          { id: 2, value: 'bar', label: 'Bar' },
        ],
        value: ['foo'],
        form: true,
        name: 'user_ids',
        clearable: true,
        multiple: true,
      });

      expect(find('input[name="user_ids"][value="foo"]')).to.exist;

      clearBtn.click();
      expect(container).not.to.have.attribute('value');
      expect(find('input[name="user_ids"][value="foo"]')).not.to.exist;

      form.reset();
      expect(JSON.parse(container.value)).to.eql(['foo']);
      expect(find('input[name="user_ids"][value="foo"]')).to.exist;
    });

    it('updates the hidden fields', async () => {
      const { form, container, input, options } = await setupFixture({
        options: [
          { id: 1, value: 'foo', label: 'Foo' },
          { id: 2, value: 'bar', label: 'Bar' },
        ],
        value: ['foo'],
        name: 'user_ids',
        form: true,
        multiple: true,
      });

      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).not.to.exist;

      container.autocomplete?.setValue([{ value: 'bar' }]);
      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).not.to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).to.exist;

      form.reset();
      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).not.to.exist;

      await openList(input);
      expect(findAll('[aria-selected="true"]').length).to.eq(1);
      expect(options[0]).to.have.attribute('aria-selected', 'true');
      expect(options[1]).to.have.attribute('aria-selected', 'false');
    });

    it('clears the hidden fields', async () => {
      const { form, container } = await setupFixture({
        options: [
          { id: 1, value: 'foo', label: 'Foo' },
          { id: 2, value: 'bar', label: 'Bar' },
        ],
        name: 'user_ids',
        form: true,
        multiple: true,
      });

      container.autocomplete?.setValue([{ value: 'bar' }]);
      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).not.to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).to.exist;

      form.reset();
      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).not.to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).not.to.exist;
    });
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

    it('deselects the selected options and removes the container value', async () => {
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

    it('updates the hidden fields', async () => {
      const { container } = await setupFixture({
        options: [
          { id: 1, value: 'foo', label: 'Foo' },
          { id: 2, value: 'bar', label: 'Bar' },
        ],
        value: ['foo'],
        name: 'user_ids',
        multiple: true,
      });

      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).not.to.exist;

      container.autocomplete?.setValue([{ value: 'bar' }]);
      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).not.to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).to.exist;

      container.autocomplete?.setValue([]);
      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).not.to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).not.to.exist;
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

    it('removes the hidden field', async () => {
      const { container } = await setupFixture({
        options: [
          { id: 1, value: 'foo', label: 'Foo' },
          { id: 2, value: 'bar', label: 'Baz' },
        ],
        value: ['foo', 'bar'],
        name: 'user_ids',
        multiple: true,
      });

      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).to.exist;

      container.autocomplete?.removeValue('foo');
      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).not.to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).to.exist;

      container.autocomplete?.removeValue('bar');
      expect(find('input[type="hidden"][name="user_ids"][value=""]')).to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="foo"]')).not.to.exist;
      expect(find('input[type="hidden"][name="user_ids"][value="bar"]')).not.to.exist;
    });
  });
});

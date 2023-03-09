import { expect, waitUntil } from '@open-wc/testing';
import { fillIn, find, triggerEvent, triggerKeyEvent } from '@ambiki/test-utils';
import * as sinon from 'sinon';
import { setupFixture, openList, expectEventArgs, expectInputLinkedWithOption } from './utils';
import '../src';

describe('AutoCompleteElement', () => {
  it('adds attributes after initializing', async () => {
    const { container, input, list, clearBtn } = await setupFixture({ options: [{ id: 1 }], clearable: true });

    expect(container.disabled).to.be.false;
    expect(input).to.have.attribute('spellcheck', 'false');
    expect(input).to.have.attribute('autocomplete', 'off');
    expect(input.disabled).to.be.false;
    expect(list).to.have.attribute('tabindex', '-1');
    expect(list).to.have.attribute('aria-orientation', 'vertical');
    expect(clearBtn).to.have.attribute('aria-label');
    expect(clearBtn).not.to.have.attribute('tabindex');
    expect(clearBtn.disabled).to.be.false;
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

  describe('disabled', () => {
    it('list cannot be opened', async () => {
      const { container, input, list } = await setupFixture({ options: [{ id: 1 }, { id: 2 }], disabled: true });

      expect(container.disabled).to.be.true;
      expect(input.disabled).to.be.true;

      await openList(input);
      expect(list.hidden).to.be.true;

      // Setter shouldn't work either
      container.open = true;
      expect(list.hidden).to.be.true;
    });

    it('clear button is disabled', async () => {
      const { clearBtn } = await setupFixture({
        options: [{ id: 1, value: 'foo' }, { id: 2 }],
        value: 'foo',
        disabled: true,
        clearable: true,
      });

      expect(clearBtn).to.have.attribute('tabindex', '-1');
      expect(clearBtn.disabled).to.be.true;
    });

    it('can be disabled using the setter function', async () => {
      const { container, input, clearBtn } = await setupFixture({
        options: [{ id: 1 }, { id: 2 }],
        clearable: true,
      });

      expect(container.disabled).to.be.false;
      expect(input.disabled).to.be.false;
      expect(clearBtn.disabled).to.be.false;
      expect(clearBtn).not.to.have.attribute('tabindex');

      container.disabled = true;

      expect(container.disabled).to.be.true;
      expect(input.disabled).to.be.true;
      expect(clearBtn.disabled).to.be.true;
      expect(clearBtn).to.have.attribute('tabindex', '-1');
    });

    it('can be enabled using the setter function', async () => {
      const { container, input, clearBtn } = await setupFixture({
        options: [{ id: 1 }, { id: 2 }],
        clearable: true,
        disabled: true,
      });

      expect(container.disabled).to.be.true;
      expect(input.disabled).to.be.true;
      expect(clearBtn.disabled).to.be.true;
      expect(clearBtn).to.have.attribute('tabindex', '-1');

      container.disabled = false;

      expect(container.disabled).to.be.false;
      expect(input.disabled).to.be.false;
      expect(clearBtn.disabled).to.be.false;
      expect(clearBtn).not.to.have.attribute('tabindex');
    });
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
});

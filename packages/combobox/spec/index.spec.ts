import { expect, fixture, html } from '@open-wc/testing';
import { find, findAll, triggerKeyEvent, triggerMouseover } from '@ambiki/test-utils';
import * as sinon from 'sinon';
import Combobox from '../src';

describe('Combobox', () => {
  it('adds attributes after initializing', async () => {
    const { input, list } = await setupFixture({ options: [{ id: 1 }] });

    expect(input).to.have.attribute('aria-expanded', 'false');
    expect(input).to.have.attribute('role', 'combobox');
    expect(input).to.have.attribute('aria-haspopup', 'listbox');
    expect(input).to.have.attribute('aria-autocomplete', 'list');
    expect(list).to.have.attribute('id');
    expect(list).to.have.attribute('role', 'listbox');
    expect(list).not.to.have.attribute('aria-multiselectable');
  });

  it('updates attributes when starting a combobox', async () => {
    const { input, list, options, combobox } = await setupFixture({ options: [{ id: 1 }] });
    const option = options[0];
    combobox.start();

    expect(input).to.have.attribute('aria-expanded', 'true');
    expect(input).to.have.attribute('aria-controls', list.id);
    expect(option).to.have.attribute('tabindex', '-1');
    expect(option).to.have.attribute('id');
    expect(option).to.have.attribute('aria-selected', 'false');
  });

  it('updates attributes when stopping a combobox', async () => {
    const { input, options, combobox } = await setupFixture({
      options: [{ id: 1, selected: true, active: true }],
    });
    const option = options[0];
    combobox.start();
    combobox.stop();

    expect(input).to.have.attribute('aria-expanded', 'false');
    expect(input).not.to.have.attribute('aria-controls');
    expect(option).to.have.attribute('aria-selected', 'false');
    expect(option).not.to.have.attribute('data-active');
  });

  it('deactivates the option with Escape key', async () => {
    const { input, options, combobox } = await setupFixture({ options: [{ id: 1, active: true }] });
    combobox.start();

    expect(find('[data-active]')).to.exist;

    await triggerKeyEvent(input, 'keydown', { key: 'Escape' });
    expect(find('[data-active]')).not.to.exist;
  });

  it('cycles downwards through the options with ArrowDown key', async () => {
    const { input, options, combobox } = await setupFixture({
      options: [{ id: 1 }, { id: 2, disabled: true }, { id: 3, hidden: true }],
    });
    combobox.start();

    // Assert there is no active option
    expect(find('[data-active]')).not.to.exist;

    await triggerKeyEvent(input, 'keydown', { key: 'ArrowDown' });
    expectInputLinkedWithOption(input, options[0]);

    await triggerKeyEvent(input, 'keydown', { key: 'ArrowDown' });
    expectInputLinkedWithOption(input, options[1]);

    // Skips hidden option and cycles to the top
    await triggerKeyEvent(input, 'keydown', { key: 'ArrowDown' });
    expectInputLinkedWithOption(input, options[0]);
  });

  it('cycles upwards through the options with ArrowDown key', async () => {
    const { input, options, combobox } = await setupFixture({
      options: [{ id: 1 }, { id: 2, disabled: true }, { id: 3, hidden: true }],
    });
    combobox.start();

    // Assert there is no active option
    expect(find('[data-active]')).not.to.exist;

    // Skips the hidden option
    await triggerKeyEvent(input, 'keydown', { key: 'ArrowUp' });
    expectInputLinkedWithOption(input, options[1]);

    await triggerKeyEvent(input, 'keydown', { key: 'ArrowUp' });
    expectInputLinkedWithOption(input, options[0]);

    // Cycles to the bottom skipping the hidden option
    await triggerKeyEvent(input, 'keydown', { key: 'ArrowUp' });
    expectInputLinkedWithOption(input, options[1]);
  });

  it('activates the first option with Home key', async () => {
    const { input, options, combobox } = await setupFixture({
      options: [{ id: 1 }, { id: 2, disabled: true }, { id: 3, hidden: true }],
    });
    combobox.start();

    // Assert there is no active option
    expect(find('[data-active]')).not.to.exist;

    // Skips the hidden option
    await triggerKeyEvent(input, 'keydown', { key: 'Home' });
    expectInputLinkedWithOption(input, options[0]);
  });

  it('activates the last option with End key', async () => {
    const { input, options, combobox } = await setupFixture({
      options: [{ id: 1 }, { id: 2 }, { id: 3, hidden: true }],
    });
    combobox.start();

    // Assert there is no active option
    expect(find('[data-active]')).not.to.exist;

    // Skips the hidden option
    await triggerKeyEvent(input, 'keydown', { key: 'End' });
    expectInputLinkedWithOption(input, options[1]);
  });

  it('commits the option with Enter and Tab key', async () => {
    const { container, input, options, combobox } = await setupFixture({ options: [{ id: 1 }] });
    combobox.start();

    await triggerKeyEvent(input, 'keydown', { key: 'ArrowDown' });
    expectInputLinkedWithOption(input, options[0]);

    const commitHandler = sinon.spy();
    container.addEventListener('combobox:commit', commitHandler);

    await triggerKeyEvent(input, 'keydown', { key: 'Enter' });
    expect(commitHandler.called).to.be.true;

    await triggerKeyEvent(input, 'keydown', { key: 'Tab' });
    expect(commitHandler.called).to.be.true;
  });

  it('does not commit the disabled option', async () => {
    const { container, input, options, combobox } = await setupFixture({ options: [{ id: 1, disabled: true }] });
    combobox.start();

    await triggerKeyEvent(input, 'keydown', { key: 'ArrowDown' });
    expectInputLinkedWithOption(input, options[0]);

    const commitHandler = sinon.spy();
    container.addEventListener('combobox:commit', commitHandler);

    await triggerKeyEvent(input, 'keydown', { key: 'Enter' });
    expect(commitHandler.called).to.be.false;

    await triggerKeyEvent(input, 'keydown', { key: 'Tab' });
    expect(commitHandler.called).to.be.false;
  });

  it('selects the option on mouse click', async () => {
    const { container, options, combobox } = await setupFixture({ options: [{ id: 1 }] });
    const option = options[0];
    combobox.start();

    const commitHandler = sinon.spy();
    container.addEventListener('combobox:commit', commitHandler);

    expect(find('[aria-selected="true"]')).not.to.exist;

    option.click();
    expect(option).to.have.attribute('aria-selected', 'true');
    expect(commitHandler.calledOnce).to.be.true;
  });

  it('does not select a disabled option', async () => {
    const { container, options, combobox } = await setupFixture({ options: [{ id: 1, disabled: true }] });
    const option = options[0];
    combobox.start();

    const commitHandler = sinon.spy();
    container.addEventListener('combobox:commit', commitHandler);

    option.click();
    expect(option).not.to.have.attribute('aria-selected', 'true');
    expect(commitHandler.called).to.be.false;
  });

  it('activates option on mouseover', async () => {
    const { input, options, combobox } = await setupFixture({ options: [{ id: 1 }] });
    const option = options[0];
    combobox.start();

    expect(find('[data-active]')).not.to.exist;

    await triggerMouseover(option);
    expectInputLinkedWithOption(input, option);
  });

  describe('#deselect', () => {
    describe('when single-select', () => {
      it('only selects one option at a time', async () => {
        const { options, combobox } = await setupFixture({ options: [{ id: 1 }, { id: 2 }] });
        combobox.start();

        combobox.select(options[0]);
        expect(options[0]).to.have.attribute('aria-selected', 'true');
        expect(options[1]).to.have.attribute('aria-selected', 'false');

        combobox.select(options[1]);
        expect(options[0]).to.have.attribute('aria-selected', 'false');
        expect(options[1]).to.have.attribute('aria-selected', 'true');
      });
    });

    describe('when multi-select', () => {
      it('selects multiple options', async () => {
        const { options, combobox } = await setupFixture({
          options: [{ id: 1 }, { id: 2 }],
          multiple: true,
        });
        combobox.start();

        combobox.select(options[0]);
        expect(options[0]).to.have.attribute('aria-selected', 'true');
        expect(options[1]).to.have.attribute('aria-selected', 'false');

        combobox.select(options[1]);
        expect(options[0]).to.have.attribute('aria-selected', 'true');
        expect(options[1]).to.have.attribute('aria-selected', 'true');
      });
    });
  });

  describe('#deselect', () => {
    it('sets aria-selected="false" on the option', async () => {
      const { options, combobox } = await setupFixture({ options: [{ id: 1, selected: true }] });
      const option = options[0];
      combobox.start();

      expect(option).to.have.attribute('aria-selected', 'true');

      combobox.deselect(option);
      expect(option).to.have.attribute('aria-selected', 'false');
    });
  });

  describe('#deselectAll', () => {
    it('sets aria-selected="false" on all the options', async () => {
      const { options, combobox } = await setupFixture({
        options: [
          { id: 1, selected: true },
          { id: 2, selected: true },
        ],
        multiple: true,
      });
      combobox.start();

      expect(options[0]).to.have.attribute('aria-selected', 'true');
      expect(options[1]).to.have.attribute('aria-selected', 'true');

      combobox.deselectAll();

      expect(options[0]).to.have.attribute('aria-selected', 'false');
      expect(options[1]).to.have.attribute('aria-selected', 'false');
    });
  });

  describe('#activate', () => {
    it('sets data-active on the option', async () => {
      const { input, options, combobox } = await setupFixture({ options: [{ id: 1 }, { id: 2, active: true }] });
      combobox.start();

      combobox.activate(options[0]);
      expect(options[0]).to.have.attribute('data-active');
      expect(options[1]).not.to.have.attribute('data-active');
      expectInputLinkedWithOption(input, options[0]);
    });
  });

  describe('#deactivate', () => {
    it('removes data-active from the options', async () => {
      const { input, combobox } = await setupFixture({ options: [{ id: 1, active: true }] });
      combobox.start();

      combobox.deactivate();
      expect(find('[data-active]')).not.to.exist;
      expect(input).not.to.have.attribute('aria-activedescendant');
    });
  });

  describe('single selection', () => {
    it('only selects one option at a time', async () => {
      const { options, combobox } = await setupFixture({ options: [{ id: 1 }, { id: 2 }] });
      combobox.start();

      options[0].click();
      expect(options[0]).to.have.attribute('aria-selected', 'true');
      expect(options[1]).not.to.have.attribute('aria-selected', 'true');

      options[1].click();
      expect(options[0]).not.to.have.attribute('aria-selected', 'true');
      expect(options[1]).to.have.attribute('aria-selected', 'true');
    });
  });

  describe('multi selection', () => {
    it('adds attributes after initializing', async () => {
      const { input } = await setupFixture({ options: [{ id: 1 }], multiple: true });
      expect(input).to.have.attribute('aria-multiselectable', 'true');
    });

    it('selects multiple options', async () => {
      const { options, combobox } = await setupFixture({
        options: [{ id: 1 }, { id: 3 }],
        multiple: true,
      });
      combobox.start();

      options[0].click();
      expect(options[0]).to.have.attribute('aria-selected', 'true');
      expect(options[1]).not.to.have.attribute('aria-selected', 'true');

      options[1].click();
      expect(options[0]).to.have.attribute('aria-selected', 'true');
      expect(options[1]).to.have.attribute('aria-selected', 'true');
    });
  });
});

function expectInputLinkedWithOption(input: HTMLInputElement, option: HTMLElement) {
  expect(option).to.have.attribute('data-active');
  expect(input).to.have.attribute('aria-activedescendant', option.id);
}

type SetupFixtureProps = {
  options: Array<{
    id: number;
    text?: string;
    selected?: boolean;
    active?: boolean;
    disabled?: boolean;
    hidden?: boolean;
  }>;
  multiple?: boolean;
};

async function setupFixture({ options, multiple = false }: SetupFixtureProps) {
  const activeOption = options.find((o) => o.active);

  await fixture(html`
    <div>
      <input type="text" ?aria-activedescendant="${activeOption?.id}" />
      <ul>
        ${options.map(
          (option) =>
            html`<li
              role="option"
              id="${option.id}"
              aria-selected="${typeof option.selected === 'undefined' ? false : option.selected ? 'true' : 'false'}"
              ?data-active="${option.active}"
              aria-disabled="${option.disabled ? 'true' : 'false'}"
              ?disabled="${option.disabled}"
              ?hidden="${option.hidden}"
            >
              ${option.text || 'Option'}
            </li>`
        )}
      </ul>
    </div>
  `);

  const input = find<HTMLInputElement>('input');
  const list = find('ul');

  return {
    container: find('div'),
    input,
    list,
    options: findAll('li[role="option"]'),
    combobox: new Combobox(input, list, { multiple }),
  };
}

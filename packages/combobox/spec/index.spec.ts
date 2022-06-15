import { expect, fixture, html } from '@open-wc/testing';
import Combobox from '../src';

function press(element: Element, key: string) {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function mouseover(element: Element) {
  element.dispatchEvent(new CustomEvent('mousemove', { bubbles: true }));
  element.dispatchEvent(new CustomEvent('mouseover', { bubbles: true }));
}

function expectInputLinkedWithOption(input: HTMLInputElement, option: HTMLElement) {
  expect(option).to.have.attribute('data-tracking');
  expect(input).to.have.attribute('aria-activedescendant', option.id);
}

describe('Combobox', () => {
  describe('starting and stopping', () => {
    let el: HTMLElement;
    let input: HTMLInputElement;
    let list: HTMLElement;
    let options: NodeListOf<HTMLElement>;
    let combobox: Combobox;

    beforeEach(async () => {
      el = await fixture(html`
        <div>
          <input type="text" aria-activedescendant="list-id" />
          <ul>
            <li role="option" data-tracking>Player</li>
            <li role="option">Taxi</li>
          </ul>
        </div>
      `);

      input = el.querySelector('input');
      list = el.querySelector('ul');
      options = list.querySelectorAll<HTMLElement>('[role="option"]');
      combobox = new Combobox(input, list);
    });

    afterEach(() => {
      combobox.stop();
    });

    it('adds default attributes', () => {
      expect(input).to.have.attribute('aria-expanded', 'false');
      expect(input).to.have.attribute('role', 'combobox');
      expect(input).to.have.attribute('aria-haspopup', 'listbox');
      expect(input).to.have.attribute('aria-controls', list.id);
      expect(input).to.have.attribute('aria-autocomplete', 'list');
      expect(input).not.to.have.attribute('aria-multiselectable');
      expect(list).to.have.attribute('role', 'listbox');
    });

    it('on starting combobox', () => {
      combobox.start();

      expect(input).to.have.attribute('aria-expanded', 'true');
      expect(input).to.have.attribute('aria-activedescendant');
      expect(options[0]).to.have.attribute('data-tracking');

      options.forEach((option) => {
        expect(option).to.have.attribute('tabindex', '-1');
        expect(option).to.have.attribute('id');
      });
    });

    it('on stopping combobox', () => {
      combobox.start();
      combobox.stop();

      expect(input).to.have.attribute('aria-expanded', 'false');
      expect(input).not.to.have.attribute('aria-activedescendant');
      expect(options[0]).not.to.have.attribute('data-tracking');
    });
  });

  describe('keyboard interaction', () => {
    let el: HTMLElement;
    let input: HTMLInputElement;
    let list: HTMLElement;
    let options: NodeListOf<HTMLElement>;
    let combobox: Combobox;

    beforeEach(async () => {
      el = await fixture(html`
        <div>
          <input type="text" />
          <ul>
            <li role="option">Player</li>
            <li role="option">Taxi</li>
            <li role="option" aria-disabled="true">Taxi</li>
            <li role="option" hidden>Taxi</li>
          </ul>
        </div>
      `);

      input = el.querySelector('input');
      list = el.querySelector('ul');
      options = list.querySelectorAll<HTMLElement>('[role="option"]');
      combobox = new Combobox(input, list);
    });

    afterEach(() => {
      combobox.stop();
    });

    it('cycles through the options with ArrowDown key', () => {
      combobox.start();

      press(input, 'ArrowDown');
      expectInputLinkedWithOption(input, options[0]);

      press(input, 'ArrowDown');
      expectInputLinkedWithOption(input, options[1]);

      press(input, 'ArrowDown');
      expectInputLinkedWithOption(input, options[2]);

      // Skips hidden option
      press(input, 'ArrowDown');
      expectInputLinkedWithOption(input, options[0]);
    });

    it('cycles through the options with ArrowUp key', () => {
      combobox.start();

      // Skips hidden option
      press(input, 'ArrowUp');
      expectInputLinkedWithOption(input, options[options.length - 2]);

      press(input, 'ArrowUp');
      expectInputLinkedWithOption(input, options[options.length - 3]);

      press(input, 'ArrowUp');
      expectInputLinkedWithOption(input, options[options.length - 4]);

      press(input, 'ArrowUp');
      expectInputLinkedWithOption(input, options[options.length - 2]);
    });

    it('commits the option on Enter and Tab key', () => {
      combobox.start();
      let expectedOption: string | null = null;

      list.addEventListener('combobox:commit', (event) => {
        expectedOption = (event.target as HTMLElement).id;
      });

      expectedOption = null;
      press(input, 'ArrowDown');
      press(input, 'Enter');
      expect(expectedOption).to.equal(options[0].id);

      expectedOption = null;
      press(input, 'Tab');
      expect(expectedOption).to.equal(options[0].id);

      expectedOption = null;
      press(input, 'ArrowDown');
      press(input, 'Enter');
      expect(expectedOption).to.equal(options[1].id);

      expectedOption = null;
      press(input, 'Tab');
      expect(expectedOption).to.equal(options[1].id);

      // No events emitted for aria-disabled options
      expectedOption = null;
      press(input, 'ArrowDown');
      press(input, 'Enter');
      expect(expectedOption).to.equal(null);

      press(input, 'Tab');
      expect(expectedOption).to.equal(null);
    });

    it('selects the option', () => {
      combobox.start();

      expect(options[0]).to.have.attribute('aria-selected', 'false');

      press(input, 'ArrowDown');
      press(input, 'Enter');
      expect(options[0]).to.have.attribute('aria-selected', 'true');

      // Other options are not selected
      expect(options[1]).to.have.attribute('aria-selected', 'false');
    });
  });

  describe('mouse interaction', () => {
    let el: HTMLElement;
    let input: HTMLInputElement;
    let list: HTMLElement;
    let options: NodeListOf<HTMLElement>;
    let combobox: Combobox;

    beforeEach(async () => {
      el = await fixture(html`
        <div>
          <input type="text" />
          <ul>
            <li role="option">Player</li>
            <li role="option">Taxi</li>
            <li role="option" aria-disabled="true">Taxi</li>
            <li role="option" hidden>Taxi</li>
          </ul>
        </div>
      `);

      input = el.querySelector('input');
      list = el.querySelector('ul');
      options = list.querySelectorAll('[role="option"]');
      combobox = new Combobox(input, list);
    });

    afterEach(() => {
      combobox.stop();
    });

    it('commits the option on click', () => {
      combobox.start();
      let expectedOption: string | null = null;

      list.addEventListener('combobox:commit', (event) => {
        expectedOption = (event.target as HTMLElement).id;
      });

      expectedOption = null;
      options[0].click();
      expect(expectedOption).to.equal(options[0].id);

      expectedOption = null;
      options[1].click();
      expect(expectedOption).to.equal(options[1].id);

      // No events emitted for aria-disabled options
      expectedOption = null;
      options[2].click();
      expect(expectedOption).to.equal(null);
    });

    it('selects the option', () => {
      combobox.start();

      expect(options[0]).to.have.attribute('aria-selected', 'false');

      options[0].click();
      expect(options[0]).to.have.attribute('aria-selected', 'true');

      // Other options are not selected
      expect(options[1]).to.have.attribute('aria-selected', 'false');
    });

    it('updates aria-activedescendant on mouseover', () => {
      combobox.start();

      mouseover(options[0]);
      expectInputLinkedWithOption(input, options[0]);

      mouseover(options[1]);
      expectInputLinkedWithOption(input, options[1]);

      mouseover(options[2]);
      expectInputLinkedWithOption(input, options[2]);
    });
  });

  describe('multiple selections', () => {
    let el: HTMLElement;
    let input: HTMLInputElement;
    let list: HTMLElement;
    let options: NodeListOf<HTMLElement>;
    let combobox: Combobox;

    beforeEach(async () => {
      el = await fixture(html`
        <div>
          <input type="text" />
          <ul>
            <li role="option">Player</li>
            <li role="option">Taxi</li>
          </ul>
        </div>
      `);

      input = el.querySelector('input');
      list = el.querySelector('ul');
      options = list.querySelectorAll<HTMLElement>('[role="option"]');
      combobox = new Combobox(input, list, { isMultiple: true });
    });

    afterEach(() => {
      combobox.stop();
    });

    it('adds aria-multiselectable', () => {
      expect(input).to.have.attribute('aria-multiselectable', 'true');
    });

    it('selecting options', () => {
      combobox.start();

      expect(options[0]).to.have.attribute('aria-selected', 'false');
      expect(options[1]).to.have.attribute('aria-selected', 'false');

      options[0].click();
      expect(options[0]).to.have.attribute('aria-selected', 'true');

      options[1].click();
      expect(options[1]).to.have.attribute('aria-selected', 'true');
    });
  });
});

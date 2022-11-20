import { expect, fixture, html, oneEvent, triggerBlurFor, triggerFocusFor, waitUntil } from '@open-wc/testing';
import { nextTick } from '@ambiki/utils';
import { find, findAll, fillIn, triggerKeyEvent } from '@ambiki/test-utils';
import '../src';
import AutoCompleteElement from '../src';

function expectOptionConnectedWithInput(option: HTMLElement, input: HTMLInputElement) {
  expect(option).to.have.attribute('data-tracking');
  expect(input).to.have.attribute('aria-activedescendant', option.id);
}

describe('AutoCompleteElement', () => {
  describe('renders', () => {
    it('sets the attributes', async () => {
      await fixture(html`
        <auto-complete for="list">
          <input type="text" />
          <ul id="list">
            <li role="option">Player</li>
            <li role="option">Taxi</li>
          </ul>
        </auto-complete>
      `);

      const input = find('input');
      const list = find('#list');

      expect(input).to.have.attribute('spellcheck', 'false');
      expect(input).to.have.attribute('autocomplete', 'off');
      expect(list).to.have.attribute('tabindex', '-1');
      expect(list).to.have.attribute('aria-orientation', 'vertical');

      await triggerFocusFor(input);
      await waitUntil(() => document.activeElement === input);
      expect(input).not.to.have.attribute('data-empty');
    });

    it('sets data-empty attribute when list is empty', async () => {
      await fixture(html`
        <auto-complete for="list">
          <input type="text" />
          <ul id="list"></ul>
        </auto-complete>
      `);

      const input = find('input');
      const list = find('#list');

      await triggerFocusFor(input);
      await waitUntil(() => document.activeElement === input);
      expect(list).to.have.attribute('data-empty');
    });

    it('sets aria-label on the clear button', async () => {
      await fixture(html`
        <auto-complete for="list">
          <button type="button" data-autocomplete-clear>Clear</button>
          <input type="text" />
          <ul id="list"></ul>
        </auto-complete>
      `);

      const button = find('[data-autocomplete-clear]');

      expect(button).to.have.attribute('aria-label', 'Clear autocomplete');
    });

    describe('single select', () => {
      it('sets aria-selected as true when there is a selected option', async () => {
        await fixture(html`
          <auto-complete for="list" value='{ "id": 2, "value": "Taxi" }'>
            <input type="text" />
            <ul id="list">
              <li role="option">Player</li>
              <li id="2" role="option">Taxi</li>
            </ul>
          </auto-complete>
        `);

        const input = find('input');
        const options = findAll('[role="option"]');
        expect(options[0]).not.to.have.attribute('aria-selected');
        expect(options[1]).not.to.have.attribute('aria-selected');

        await triggerFocusFor(input);
        expect(options[0]).to.have.attribute('aria-selected', 'false');
        expect(options[1]).to.have.attribute('aria-selected', 'true');
      });
    });

    describe('multi select', () => {
      it('sets aria-selected as true when there are selected options', async () => {
        await fixture(html`
          <auto-complete
            for="list"
            multiple
            value='[{ "id": 2, "value": "Taxi" }, { "id": "3", "value": "Manhattan" }]'
          >
            <input type="text" />
            <ul id="list">
              <li role="option">Player</li>
              <li id="2" role="option">Taxi</li>
              <li id="3" role="option">Manhattan</li>
            </ul>
          </auto-complete>
        `);

        const input = find('input');
        const options = findAll('[role="option"]');
        expect(options[0]).not.to.have.attribute('aria-selected');
        expect(options[1]).not.to.have.attribute('aria-selected');
        expect(options[2]).not.to.have.attribute('aria-selected');

        await triggerFocusFor(input);
        expect(options[0]).to.have.attribute('aria-selected', 'false');
        expect(options[1]).to.have.attribute('aria-selected', 'true');
        expect(options[2]).to.have.attribute('aria-selected', 'true');
      });
    });
  });

  describe('initial focus', () => {
    it('focuses on the first option when there are no selected option', async () => {
      await fixture(html`
        <auto-complete for="list">
          <input type="text" />
          <ul id="list">
            <li role="option">Player</li>
            <li role="option">Taxi</li>
          </ul>
        </auto-complete>
      `);

      const input = find<HTMLInputElement>('input');
      const list = find('#list');
      const options = findAll('[role="option"]');
      expect(list.hidden).to.be.true;

      await triggerFocusFor(input);

      expect(list.hidden).to.be.false;
      expect(input).to.have.attribute('aria-expanded', 'true');

      await nextTick();
      expectOptionConnectedWithInput(options[0], input);
      expect(options[1]).not.to.have.attribute('data-tracking');
    });

    describe('single select', () => {
      it('focuses on the selected option', async () => {
        await fixture(html`
          <auto-complete for="list" value='{ "id": 2, "value": "Taxi" }'>
            <input type="text" />
            <ul id="list">
              <li role="option">Player</li>
              <li id="2" role="option">Taxi</li>
            </ul>
          </auto-complete>
        `);

        const input = find<HTMLInputElement>('input');
        const list = find('#list');
        const options = findAll('[role="option"]');
        expect(list.hidden).to.be.true;

        await triggerFocusFor(input);

        expect(list.hidden).to.be.false;
        expect(input).to.have.attribute('aria-expanded', 'true');

        await nextTick();
        expectOptionConnectedWithInput(options[1], input);
        expect(options[0]).not.to.have.attribute('data-tracking');
      });
    });

    describe('multi select', () => {
      it('focuses on the first option from the list', async () => {
        await fixture(html`
          <auto-complete
            for="list"
            multiple
            value='[{ "id": 2, "value": "Taxi" }, { "id": "3", "value": "Manhattan" }]'
          >
            <input type="text" />
            <ul id="list">
              <li role="option">Player</li>
              <li id="2" role="option">Taxi</li>
              <li id="3" role="option">Manhattan</li>
            </ul>
          </auto-complete>
        `);

        const input = find<HTMLInputElement>('input');
        const list = find('#list');
        const options = findAll('[role="option"]');
        expect(list.hidden).to.be.true;

        await triggerFocusFor(input);

        expect(list.hidden).to.be.false;
        expect(input).to.have.attribute('aria-expanded', 'true');

        await nextTick();
        expectOptionConnectedWithInput(options[1], input);
        expect(options[0]).not.to.have.attribute('data-tracking');
        expect(options[2]).not.to.have.attribute('data-tracking');
      });
    });
  });

  describe('selecting option(s)', () => {
    describe('Enter key', () => {
      it('selects the option', async () => {
        await fixture(html`
          <auto-complete for="list">
            <input type="text" />
            <ul id="list">
              <li id="1" role="option">Player</li>
            </ul>
          </auto-complete>
        `);

        const el = find<AutoCompleteElement>('auto-complete');
        const input = find<HTMLInputElement>('input');
        const list = find('#list');
        const options = findAll('[role="option"]');
        let relatedTarget: HTMLElement;

        el.addEventListener(
          'auto-complete:commit',
          (event) => {
            relatedTarget = (event as CustomEvent).detail.relatedTarget;
            expect(relatedTarget).to.equal(options[0]);
          },
          { once: true }
        );

        await triggerFocusFor(input);
        await nextTick();
        expect(list.hidden).to.be.false;
        expectOptionConnectedWithInput(options[0], input);
        expect(el.multiple).to.be.false;

        await triggerKeyEvent(input, 'keydown', { key: 'Enter' });

        expect(JSON.parse(el.value)).to.eql({ id: '1', value: 'Player' });
        expect(list.hidden).to.be.true;
      });
    });

    describe('Tab key', () => {
      it('selects the option', async () => {
        await fixture(html`
          <auto-complete for="list">
            <input type="text" />
            <ul id="list">
              <li id="1" role="option">Player</li>
            </ul>
          </auto-complete>
        `);

        const el = find<AutoCompleteElement>('auto-complete');
        const input = find<HTMLInputElement>('input');
        const list = find('#list');
        const options = findAll('[role="option"]');
        let relatedTarget: HTMLElement;

        el.addEventListener(
          'auto-complete:commit',
          (event) => {
            relatedTarget = (event as CustomEvent).detail.relatedTarget;
            expect(relatedTarget).to.equal(options[0]);
          },
          { once: true }
        );

        await triggerFocusFor(input);
        await nextTick();
        expect(list.hidden).to.be.false;
        expectOptionConnectedWithInput(options[0], input);
        expect(el.multiple).to.be.false;

        await triggerKeyEvent(input, 'keydown', { key: 'Tab' });

        expect(JSON.parse(el.value)).to.eql({ id: '1', value: 'Player' });
        expect(list.hidden).to.be.true;
      });
    });

    describe('disabled option', () => {
      it('cannot select disabled options', async () => {
        await fixture(html`
          <auto-complete for="list">
            <input type="text" />
            <ul id="list">
              <li role="option" disabled>Player</li>
            </ul>
          </auto-complete>
        `);

        const el = find<AutoCompleteElement>('auto-complete');
        const input = find<HTMLInputElement>('input');
        const list = find('#list');
        const options = findAll('[role="option"]');
        let relatedTarget: HTMLElement;

        el.addEventListener(
          'auto-complete:commit',
          (event) => {
            relatedTarget = (event as CustomEvent).detail.relatedTarget;
            expect(relatedTarget).to.equal(null);
          },
          { once: true }
        );

        await triggerFocusFor(input);
        await nextTick();
        expect(list.hidden).to.be.false;
        expectOptionConnectedWithInput(options[0], input);

        options[0].click();
        expect(el.value).to.equal('');
      });
    });

    describe('single select', () => {
      it('selects an option and fires `auto-complete:commit` event', async () => {
        await fixture(html`
          <auto-complete for="list">
            <input type="text" />
            <ul id="list">
              <li id="1" role="option">Player</li>
              <li role="option">Taxi</li>
            </ul>
          </auto-complete>
        `);

        const el = find<AutoCompleteElement>('auto-complete');
        const input = find<HTMLInputElement>('input');
        const list = find('#list');
        const options = findAll('[role="option"]');
        let relatedTarget: HTMLElement;

        el.addEventListener(
          'auto-complete:commit',
          (event) => {
            relatedTarget = (event as CustomEvent).detail.relatedTarget;
            expect(relatedTarget).to.equal(options[0]);
          },
          { once: true }
        );

        await triggerFocusFor(input);
        await nextTick();
        expect(list.hidden).to.be.false;
        expectOptionConnectedWithInput(options[0], input);
        expect(el.multiple).to.be.false;

        options[0].click();

        expect(JSON.parse(el.value)).to.eql({ id: '1', value: 'Player' });
        expect(list.hidden).to.be.true;
      });
    });

    describe('multi select', () => {
      it('selects multiple options and fires `auto-complete:commit` event', async () => {
        await fixture(html`
          <auto-complete for="list" multiple>
            <input type="text" />
            <ul id="list">
              <li id="1" role="option">Player</li>
              <li id="2" role="option">Taxi</li>
            </ul>
          </auto-complete>
        `);

        const el = find<AutoCompleteElement>('auto-complete');
        const input = find<HTMLInputElement>('input');
        const list = find('#list');
        const options = findAll('[role="option"]');
        let relatedTarget: HTMLElement | null;

        el.addEventListener('auto-complete:commit', (event) => {
          relatedTarget = (event as CustomEvent).detail.relatedTarget;
        });

        await triggerFocusFor(input);
        await nextTick();
        expect(list.hidden).to.be.false;
        expectOptionConnectedWithInput(options[0], input);
        expect(el.multiple).to.be.true;

        options[0].click();
        relatedTarget = null;
        await oneEvent(el, 'auto-complete:commit');
        expect(relatedTarget).to.equal(options[0]);
        expect(JSON.parse(el.value)).to.eql([{ id: '1', value: 'Player' }]);
        expect(list.hidden).to.be.false;
        expect(document.activeElement).to.equal(input);

        options[1].click();
        relatedTarget = null;
        await oneEvent(el, 'auto-complete:commit');
        expect(relatedTarget).to.equal(options[1]);
        expect(JSON.parse(el.value)).to.eql([
          { id: '1', value: 'Player' },
          { id: '2', value: 'Taxi' },
        ]);
        expect(list.hidden).to.be.false;
        expect(document.activeElement).to.equal(input);
      });
    });
  });

  describe('keyboard interactions', () => {
    it('opens the list on alt+ArrowDown key', async () => {
      await fixture(html`
        <auto-complete for="list" value='{ "id": "1", "value": "Player" }'>
          <input type="text" />
          <ul id="list">
            <li id="1" role="option">Player</li>
            <li role="option">Taxi</li>
          </ul>
        </auto-complete>
      `);

      const input = find('input');
      const list = find('#list');

      await triggerFocusFor(input);
      await nextTick();
      expect(list.hidden).to.be.false;

      await triggerKeyEvent(input, 'keydown', { key: 'Escape' });
      expect(list.hidden).to.be.true;

      await triggerKeyEvent(input, 'keydown', { key: 'ArrowDown', altKey: true });
      expect(list.hidden).to.be.false;
    });

    it('closes the list on Escape key', async () => {
      await fixture(html`
        <auto-complete for="list" value='{ "id": "1", "value": "Player" }'>
          <input type="text" />
          <ul id="list">
            <li id="1" role="option">Player</li>
            <li role="option">Taxi</li>
          </ul>
        </auto-complete>
      `);

      const input = find('input');
      const list = find('#list');

      await triggerFocusFor(input);
      await nextTick();
      expect(list.hidden).to.be.false;

      await triggerKeyEvent(input, 'keydown', { key: 'Escape' });
      expect(list.hidden).to.be.true;
    });

    it('closes the list on alt+ArrowUp key', async () => {
      await fixture(html`
        <auto-complete for="list" value='{ "id": "1", "value": "Player" }'>
          <input type="text" />
          <ul id="list">
            <li id="1" role="option">Player</li>
            <li role="option">Taxi</li>
          </ul>
        </auto-complete>
      `);

      const input = find('input');
      const list = find('#list');

      await triggerFocusFor(input);
      await nextTick();
      expect(list.hidden).to.be.false;

      await triggerKeyEvent(input, 'keydown', { key: 'ArrowUp', altKey: true });
      expect(list.hidden).to.be.true;
    });

    it('cycles through the options with arrow keys', async () => {
      await fixture(html`
        <auto-complete for="list">
          <input type="text" />
          <ul id="list">
            <li role="option">Player</li>
            <li role="option" disabled>Taxi</li>
            <li role="option">Manhattan</li>
          </ul>
        </auto-complete>
      `);

      const input = find<HTMLInputElement>('input');
      const list = find('#list');
      const options = findAll('[role="option"]');

      await triggerFocusFor(input);
      await nextTick();
      expect(list.hidden).to.be.false;

      expectOptionConnectedWithInput(options[0], input);
      await triggerKeyEvent(input, 'keydown', { key: 'ArrowDown' });
      expectOptionConnectedWithInput(options[1], input);
      await triggerKeyEvent(input, 'keydown', { key: 'ArrowDown' });
      expectOptionConnectedWithInput(options[2], input);
      await triggerKeyEvent(input, 'keydown', { key: 'ArrowDown' });
      expectOptionConnectedWithInput(options[0], input);
      await triggerKeyEvent(input, 'keydown', { key: 'ArrowUp' });
      expectOptionConnectedWithInput(options[2], input);
    });
  });

  describe('opening the list', () => {
    it('opens the list with pointer down when the input has focus', async () => {
      await fixture(html`
        <auto-complete for="list">
          <input type="text" />
          <ul id="list"></ul>
        </auto-complete>
      `);

      const input = find('input');
      const list = find('#list');

      await triggerFocusFor(input);
      await nextTick();
      expect(list.hidden).to.be.false;
      await triggerKeyEvent(input, 'keydown', { key: 'Escape' });
      expect(list.hidden).to.be.true;
      expect(document.activeElement).to.equal(input);

      input.dispatchEvent(new MouseEvent('pointerdown'));
      expect(list.hidden).to.be.false;
    });
  });

  describe('closing the list', () => {
    it('removes data-empty attribute from the list', async () => {
      await fixture(html`
        <auto-complete for="list">
          <input type="text" />
          <ul id="list"></ul>
        </auto-complete>
      `);

      const input = find('input');
      const list = find('#list');
      await triggerFocusFor(input);
      await waitUntil(() => document.activeElement === input);
      expect(list).to.have.attribute('data-empty');

      await triggerBlurFor(input);
      await waitUntil(() => list.hidden === true);
      expect(list).not.to.have.attribute('data-empty');
    });

    it('clears out the input field', async () => {
      await fixture(html`
        <auto-complete for="list">
          <input type="text" />
          <ul id="list">
            <li role="option">Player</li>
            <li role="option">Taxi</li>
          </ul>
        </auto-complete>
      `);

      const input = find<HTMLInputElement>('input');
      await triggerFocusFor(input);
      await fillIn(input, 'Hello world');
      expect(input.value).to.equal('Hello world');

      await triggerBlurFor(input);
      expect(input.value).to.equal('');
    });

    describe('single select', () => {
      it('sets the input value to the selected value', async () => {
        await fixture(html`
          <auto-complete for="list" value='{ "id": "1", "value": "Player" }'>
            <input type="text" />
            <ul id="list">
              <li id="1" role="option">Player</li>
              <li role="option">Taxi</li>
            </ul>
          </auto-complete>
        `);

        const input = find<HTMLInputElement>('input');
        await triggerFocusFor(input);
        expect(input.value).to.equal('Player');

        await triggerFocusFor(input);
        await fillIn(input, 'Hello world');
        expect(input.value).to.equal('Hello world');

        await triggerBlurFor(input);
        expect(input.value).to.equal('Player');
      });
    });

    describe('multi select', () => {
      it('clears out the input field even if there is a selected option', async () => {
        await fixture(html`
          <auto-complete for="list" multiple value='[{ "id": "1", "value": "Player" }]'>
            <input type="text" />
            <ul id="list">
              <li id="1" role="option">Player</li>
              <li role="option">Taxi</li>
            </ul>
          </auto-complete>
        `);

        const input = find<HTMLInputElement>('input');
        await triggerFocusFor(input);
        expect(input.value).to.equal('');

        await triggerFocusFor(input);
        await fillIn(input, 'Hello world');
        expect(input.value).to.equal('Hello world');

        await triggerBlurFor(input);
        expect(input.value).to.equal('');
      });
    });
  });

  describe('clearing', () => {
    it('removes the value attribute and dispatches `auto-complete:clear` event', async () => {
      await fixture(html`
        <auto-complete for="list" value='{ "id": "1", "value": "Player" }'>
          <input type="text" />
          <button type="button" data-autocomplete-clear>Clear</button>
          <ul id="list">
            <li id="1" role="option">Player</li>
            <li role="option">Taxi</li>
          </ul>
        </auto-complete>
      `);

      const el = find<AutoCompleteElement>('auto-complete');
      const input = find<HTMLInputElement>('input');
      const list = find('#list');
      const button = find<HTMLButtonElement>('[data-autocomplete-clear]');
      let cleared = false;

      el.addEventListener(
        'auto-complete:clear',
        () => {
          cleared = true;
        },
        { once: true }
      );

      expect(el).to.have.attribute('value');
      expect(input.value).to.equal('Player');
      await triggerFocusFor(input);
      await nextTick();
      expect(list.hidden).to.be.false;

      button.click();
      expect(cleared).to.be.true;
      expect(document.activeElement).to.equal(input);
      expect(list.hidden).to.be.true;
      expect(el).not.to.have.attribute('value');
      expect(input.value).to.equal('');
    });
  });
});

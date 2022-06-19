import { expect, fixture, html } from '@open-wc/testing';
import '../src';
import type DetailsModalElement from '../src';

describe('DetailsModalElement', () => {
  describe('after initializing', () => {
    let el: HTMLDetailsElement;
    let summary: HTMLElement;
    let modal: DetailsModalElement;
    let button: HTMLButtonElement;

    beforeEach(async () => {
      el = await fixture(html`
        <details>
          <summary>Summary</summary>
          <details-modal>
            <h1>A modal</h1>
            <button type="button" data-modal-close>Button</button>
          </details-modal>
        </details>
      `);

      summary = el.querySelector('summary');
      modal = el.querySelector('details-modal');
      button = el.querySelector('button');
    });

    it('sets the default attributes', () => {
      expect(summary).to.have.attribute('role', 'button');
      expect(modal).to.have.attribute('role', 'dialog');
      expect(modal).to.have.attribute('aria-modal', 'true');
    });

    it('focuses on the first valid focusable element after opening the modal', async () => {
      el.open = true;
      await waitForToggle(el);

      expect(document.activeElement).to.equal(button);
    });

    it('focuses on the summary after closing the modal', async () => {
      el.open = true;
      expect(el.open).to.equal(true);

      el.open = false;
      await waitForToggle(el);
      expect(el.open).to.equal(false);
      expect(document.activeElement).to.equal(summary);
    });

    it('closes the modal with the Escape key', async () => {
      el.open = true;
      expect(el.open).to.equal(true);

      modal.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(el.open).to.equal(false);
      expect(document.activeElement).to.equal(summary);
    });

    it('closes the modal when data-modal-close is clicked', async () => {
      el.open = true;
      expect(el.open).to.equal(true);

      const closeButton = el.querySelector<HTMLElement>('[data-modal-close]');
      closeButton.click();
      expect(el.open).to.equal(false);
      expect(document.activeElement).to.equal(summary);
    });
  });

  describe('intercepting tabbing order', () => {
    let el: HTMLElement;
    let details: HTMLDetailsElement;
    let modal: DetailsModalElement;
    let button: HTMLButtonElement;
    let input: HTMLInputElement;

    beforeEach(async () => {
      el = await fixture(html`
        <div>
          <details>
            <summary>Summary</summary>
            <details-modal>
              <h1>A modal</h1>
              <button type="button">Button</button>
              <input type="text" />
            </details-modal>
          </details>
          <button type="button">Outside button</button>
        </div>
      `);

      details = el.querySelector('details');
      modal = details.querySelector('details-modal');
      button = details.querySelector('button');
      input = details.querySelector('input');
    });

    it('only focuses inside the modal with the Tab key', async () => {
      details.open = true;
      await waitForToggle(details);
      expect(details.open).to.equal(true);
      expect(document.activeElement).to.equal(button);

      modal.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(document.activeElement).to.equal(input);

      modal.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
      expect(document.activeElement).to.equal(button);
    });

    it('only focuses inside the modal with the Shift+Tab key', async () => {
      details.open = true;
      await waitForToggle(details);
      expect(details.open).to.equal(true);
      expect(document.activeElement).to.equal(button);

      modal.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
      expect(document.activeElement).to.equal(input);

      modal.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
      expect(document.activeElement).to.equal(button);
    });
  });

  describe('with autofocus element', () => {
    let el: HTMLDetailsElement;
    let modal: DetailsModalElement;

    beforeEach(async () => {
      el = await fixture(html`
        <details>
          <summary>Summary</summary>
          <details-modal>
            <h1>A modal</h1>
            <input type="text" />
            <button type="button" autofocus>Button</button>
          </details-modal>
        </details>
      `);

      modal = el.querySelector('details-modal');
    });

    it('focuses the button after opening the modal', async () => {
      el.open = true;
      await waitForToggle(el);

      const button = el.querySelector('button');
      expect(document.activeElement).to.equal(button);
    });

    it('does not set the tabindex on the modal', async () => {
      el.open = true;
      await waitForToggle(el);

      expect(modal).not.to.have.attribute('tabindex');
    });
  });

  describe('without any focusable elements', () => {
    let el: HTMLDetailsElement;
    let modal: DetailsModalElement;

    beforeEach(async () => {
      el = await fixture(html`
        <details>
          <summary>Summary</summary>
          <details-modal>
            <h1>A modal</h1>
          </details-modal>
        </details>
      `);

      modal = el.querySelector('details-modal');
    });

    it('sets tabindex of -1 on the modal', async () => {
      el.open = true;
      await waitForToggle(el);

      expect(document.activeElement).to.equal(modal);
      expect(modal).to.have.attribute('tabindex', '-1');
    });

    it('removes tabindex after closing', async () => {
      el.open = true;
      await waitForToggle(el);

      expect(document.activeElement).to.equal(modal);
      expect(modal).to.have.attribute('tabindex', '-1');

      el.open = false;
      await waitForToggle(el);

      expect(modal).to.not.have.attribute('tabindex');
    });
  });

  describe('with method="dialog" form', () => {
    let el: HTMLDetailsElement;
    let button: HTMLButtonElement;

    beforeEach(async () => {
      el = await fixture(html`
        <details>
          <summary>Summary</summary>
          <details-modal>
            <form method="dialog">
              <button type="submit">Submit</button>
            </form>
          </details-modal>
        </details>
      `);

      button = el.querySelector('button');
    });

    it('closes the modal on submit', async () => {
      el.open = true;
      await waitForToggle(el);
      expect(el.open).to.equal(true);

      button.click();
      expect(el.open).to.equal(false);
    });
  });

  describe('with role="none" on summary', () => {
    let el: HTMLDetailsElement;
    let summary: HTMLElement;
    let button: HTMLButtonElement;

    beforeEach(async () => {
      el = await fixture(html`
        <details>
          <summary role="none">Summary</summary>
          <details-modal>
            <h1>Content</h1>
            <button type="button" data-modal-close>Button</button>
          </details-modal>
        </details>
      `);

      summary = el.querySelector('summary');
      button = el.querySelector('[data-modal-close]');
    });

    it('does not focuses on the summary after close', async () => {
      el.open = true;
      button.click();

      expect(document.activeElement).not.to.equal(summary);
    });
  });
});

function waitForToggle(details: HTMLDetailsElement) {
  return new Promise<void>((resolve) => {
    details.addEventListener('toggle', () => resolve(), { once: true });
  });
}

import { expect, fixture, html } from '@open-wc/testing';
import '../src';
import type ClippyCopyElement from '../src';

function press(element: Element, key: string) {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('ClippyCopyElement', () => {
  const nativeClipboard = navigator.clipboard;
  let whenCopied: Promise<void>;

  beforeEach(() => {
    let copiedText = null;

    defineClipboard({
      writeText(text: string) {
        copiedText = text;
        return Promise.resolve();
      },
    });

    whenCopied = new Promise((resolve) => {
      document.addEventListener('clippy-copy:copied', () => resolve(copiedText), { once: true });
    });
  });

  afterEach(() => {
    defineClipboard(nativeClipboard);
  });

  it('sets the default attributes', async () => {
    const el = await fixture(html`<clippy-copy value="Copy text"></clippy-copy>`);

    expect(el).to.have.attribute('tabindex', '0');
    expect(el).to.have.attribute('role', 'button');
  });

  it('copies from the value attribute', async () => {
    const el: ClippyCopyElement = await fixture(html`<clippy-copy value="Copy text"></clippy-copy>`);
    el.click();

    const text = await whenCopied;
    expect(text).to.equal('Copy text');
  });

  it('copies from the input field', async () => {
    const el = await fixture(html`
      <div>
        <input type="text" id="input" value="Something good" />
        <clippy-copy for="input"></clippy-copy>
      </div>
    `);
    const button = el.querySelector('clippy-copy');
    button.click();

    const text = await whenCopied;
    expect(text).to.equal('Something good');
  });

  it('copies from the textarea', async () => {
    const el = await fixture(html`
      <div>
        <textarea id="textarea">Copy from textarea</textarea>
        <clippy-copy for="textarea"></clippy-copy>
      </div>
    `);
    const button = el.querySelector('clippy-copy');
    button.click();

    const text = await whenCopied;
    expect(text).to.equal('Copy from textarea');
  });

  it('copies the innerHTML', async () => {
    const el = await fixture(html`
      <div>
        <div id="inner">Great content</div>
        <clippy-copy for="inner"></clippy-copy>
      </div>
    `);
    const button = el.querySelector('clippy-copy');
    button.click();

    const text = await whenCopied;
    expect(text).to.equal('Great content');
  });

  describe('keyboard interactions', () => {
    let el: Element;
    let button: HTMLElement;

    beforeEach(async () => {
      el = await fixture(html`
        <div>
          <div id="inner">Copying with keyboard interaction</div>
          <clippy-copy for="inner"></clippy-copy>
        </div>
      `);

      button = el.querySelector('clippy-copy');
      button.focus();
    });

    it('copies when pressing Enter', async () => {
      press(button, 'Enter');

      const text = await whenCopied;
      expect(text).to.equal('Copying with keyboard interaction');
    });

    it('copies when pressing Space', async () => {
      press(button, ' ');

      const text = await whenCopied;
      expect(text).to.equal('Copying with keyboard interaction');
    });
  });
});

interface WriteTextProps {
  writeText: (string: string) => Promise<void>;
}

function defineClipboard(customClipboard: Clipboard | WriteTextProps) {
  Object.defineProperty(navigator, 'clipboard', {
    enumerable: false,
    configurable: true,
    get() {
      return customClipboard;
    },
  });
}

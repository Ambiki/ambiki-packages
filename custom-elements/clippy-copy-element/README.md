# Clippy Copy Element

A clipboard element to copy text content, input values, and more.

## Installation

```bash
npm install @ambiki/clippy-copy-element
```

## Usage

```js
import '@ambiki/clippy-copy-element'
```

### Copying an input's value
```html
<input id="input" type="text" value="Some value">
<clippy-copy for="input">Copy</clippy-copy>
```
> Similarly, we also support `textarea` and `select` tags.

### Copying an element's `textContent`
```html
<div id="element">
  Copy me!
</div>
<clippy-copy for="element">Copy</clippy-copy>
```

### Copying from an attribute
```html
<clippy-copy value="Copy this text!">Copy</clippy-copy>
```

## Listening for events

`clippy-copy:copied` event will be dispatched from the `<clippy-copy>` element after copying to the clipboard.

```js
document.addEventListener('clippy-copy:copied', (event) => {
  const button = event.target;
  button.setAttribute('aria-label', 'Copied!');
})
```

## License
Distributed under the MIT license.

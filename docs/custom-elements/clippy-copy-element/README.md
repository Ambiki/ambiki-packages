---
tags:
  - clipboard
  - paste
---

# Clippy Copy Element

Copy text content, input values, and more to your clipboard.

## Installation

<code-group>
  <code-block title="YARN">
  ```bash
  yarn add @ambiki/clippy-copy-element
  ```
  </code-block>

  <code-block title="NPM">
  ```bash
  npm install @ambiki/clippy-copy-element
  ```
  </code-block>
</code-group>

After installing,

```bash
import '@ambiki/clippy-copy-element';
```

## Examples

### Copying an input's value

```html
<div>
  <input id="input" type="text" value="Some value" />
</div>
<clippy-copy for="input">Copy</clippy-copy>
```

> Similarly, we also support `textarea` and `select` tags.

### Copying an element's `textContent`

```html
<div id="element">Copy me!</div>
<clippy-copy for="element">Copy</clippy-copy>
```

### Copying from an attribute

```html
<clippy-copy value="Copy this text!">Copy</clippy-copy>
```

## Events

| Name                 | Description                                                           |
|----------------------|-----------------------------------------------------------------------|
| `clippy-copy:copied` | This event is fired immediately after successfully copying the value. |

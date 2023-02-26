---
tags:
  - clipboard
  - paste
---

# Clippy Copy Element

Copy text content, input values, and more to your clipboard.

## Installation

```bash
npm install @ambiki/clippy-copy-element
```

## Usage

```bash
import '@ambiki/clippy-copy-element';
```

### Copying an input's value

```html
<input id="input" type="text" value="Some value" /> <clippy-copy for="input">Copy</clippy-copy>
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

| Event                |                              Description                              |
| -------------------- | :-------------------------------------------------------------------: |
| `clippy-copy:copied` | This event is fired immediately after successfully copying the value. |

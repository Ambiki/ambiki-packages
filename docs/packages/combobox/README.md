---
tags:
  - command palette
  - autocomplete
---

# Combobox

Extend your autocomplete and command palette using the Combobox, which provides robust keyboard navigation and accessibility out of the box.

## Installation

<code-group>
  <code-block title="YARN">
  ```bash
  yarn add @ambiki/combobox
  ```
  </code-block>

  <code-block title="NPM">
  ```bash
  npm install @ambiki/combobox
  ```
  </code-block>
</code-group>

## Initialize your combobox

Given the following markup:

```html
<div>
  <input type="text" />

  <ul hidden>
    <li role="option">Option 1</li>
    <li role="option">Option 2</li>
  </ul>
</div>
```

```js
import Combobox from '@ambiki/combobox';

const input = document.querySelector('input');
const list = document.querySelector('ul');
const combobox = new Combobox(input, list);
```

If multiple selections are allowed, then set `multiple: true`. By default, it's `false`.

```js
const combobox = new Combobox(input, list, { multiple: true });
```

## API

### `start`

Sets up event listeners and attributes on the elements.

```js
combobox.start();
```

### `stop`

Removes event listeners and attributes from the elements.

```js
combobox.stop();
```

### `select`

Sets `aria-selected="true"` on the option element. If it's a single select, then it deselects all the options and
selects only the provided option.

```js
const option = list.querySelector('li[role="option"]');
combobox.select(option);
```

### `deselect`

Sets `aria-selected="false"` on the option element.

```js
const option = list.querySelector('li[role="option"]');
combobox.deselect(option);
```

### `deselectAll`

Sets `aria-selected="false"` on all the option elements.

```js
combobox.deselectAll();
```

### `activate`

Sets `data-active` attribute on the option element. It also sets `aria-activedescendant` as the `id` of the option
on the input field.

```js
const option = list.querySelector('li[role="option"]');
combobox.activate(option);
```

You can also scroll to the activated option by setting `scroll: true`. By default, it's `false`.

```js
combobox.activate(option, { scroll: true });
```

### `deactivate`

Removes `data-active` and `aria-activedescendant` attribute from the option and input field respectively.

```js
combobox.deactivate();
```

### `isSelected`

Returns `true` if the option has `aria-selected="true"`, `false` otherwise.

```js
const option = list.querySelector('li[role="option"]');
combobox.isSelected(option);
// false
```

### `options`

Returns an array of all the option elements within the list.

```js
combobox.options;
```

### `activeOption`

Returns the option element that has the `data-active` attribute

```js
const option = list.querySelector('li[role="option"]');
combobox.activate(option);
combobox.activeOption;
// option
```

### `initializeOptions`

Sets `tabindex="-1"`, `id`, and `aria-selected="false"` on the options.

```js
combobox.initializeOptions();
```

## Events

| Event             |                                                              Description                                                               |
| ----------------- | :------------------------------------------------------------------------------------------------------------------------------------: |
| `combobox:commit` | This event is fired after selecting/deselecting an option. The option element will be available as the `target` property of the event. |

# Combobox

Extend your autocomplete and command palette using the Combobox, which provides robust keyboard navigation and
accessibility out of the box.

## Installation

```bash
npm install @ambiki/combobox
```

## Usage

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

> Requirements

- Each option should have `role="option"` attribute

```js
import Combobox from '@ambiki/combobox';

const input = document.querySelector('input');
const list = document.querySelector('ul');

const combobox = new Combobox(input, list);
combobox.start(); // Start adding keyboard events, `aria` attributes, etc, when the `list` appears
combobox.stop(); // Remove keyboard events, `aria` attributes, etc, when the `list` disappears

combobox.move(1); // Activate nth+1 option
combobox.move(-1); // Activate nth-1 option

combobox.selectOption(option); // Toggle `aria-selected="true"` attribute. Option should have `role="option"` attribute
combobox.setActive(option); // Activate an option manually. Option should have `role="option"` attribute

combobox.clearActiveOption(); // Clear active option

combobox.activeOption; // Get the current active option
combobox.visibleOptions; // Get all the visible options within the `list`
combobox.options; // Get all the options within the `list`
```

### Multiple selections

Allows multiple options to have `aria-selected="true"` attribute.

```js
const combobox = new Combobox(input, list, { isMultiple: true });
```

### Adding a max constraint

Allow a max of 3 options to be selected. Only works for multi-select combobox.

```js
const combobox = new Combobox(input, list, { isMultiple: true, max: 3 });
```

## Events

- `combobox:commit` (bubbles) - This event is fired on the `option` when an option is selected or unselected

```js
const list = document.querySelector('ul');

list.addEventListener('combobox:commit', (event) => {
  console.log('Option: ', event.target);
});
```

## License

Distributed under the MIT license.

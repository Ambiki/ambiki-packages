# Auto Complete Element

Single and multi auto-complete component.

## Installation

```bash
npm install @ambiki/auto-complete-element
```

## Usage

```js
import '@ambiki/auto-complete-element'
```

### Markup

```html
<auto-complete for="list">
  <input type="text">
  <ul id="list" hidden>
    <li role="option">Option 1</li>
    <li role="option">Option 2</li>
    <li role="option">Option 3</li>
  </ul>
</auto-complete>
```

### Multiple selections

You can set the `multiple` attribute on the `<auto-complete>` to allow selections on multiple options.

```html
<auto-complete for="list" multiple>
  <input type="text">
  <ul id="list" hidden>
    <li role="option">Option 1</li>
    <li role="option">Option 2</li>
    <li role="option">Option 3</li>
  </ul>
</auto-complete>
```

### Filtering options

The default filtering logic is substring.

The `data-autocomplete-value` can be used to customize the search term.

```html
<li role="option" data-autocomplete-value="Battlestar">Option<li>
```

#### Blankslate

`data-empty` attribute is added to the list container when search results is empty. You can use CSS to show/hide
the blankslate like this:

```html
<auto-complete for="list">
  <input type="text">
  <ul id="list" class="container" hidden>
    <li role="option">Option 1</li>
    <li class="blankslate">No results found!</li>
  </ul>
</auto-complete>
```

```css
.blankslate {
  display: none;
}

.container[data-empty] .blankslate {
  display: block;
}
```

### Resetting the selections

Add `data-autocomplete-reset` attribute to an element and it will reset all the selections, aria attributes, etc.

```html
<auto-complete for="list">
  <input type="text">
  <button type="button" data-autocomplete-reset>Reset</button>

  <ul id="list" class="container" hidden>
    <li role="option">Option 1</li>
  </ul>
</auto-complete>
```

### Selections via `aria-selected="true"` attribute

`aria-selected="true"` is set on the selected option which can be used to differentiate the selected elements from
the non-selected elements visually via CSS.

```html
<auto-complete for="list">
  <input type="text">
  <ul id="list" hidden>
    <li role="option" aria-selected="true">
      Option 1
      <span>(selected)</span>
    </li>
    <li role="option">
      Option 2
      <span>(selected)</span>
    </li>
  </ul>
</auto-complete>
```

```css
li[role="option"] > span {
  display: none;
}

li[role="option"][aria-selected="true"] > span {
  display: inline-block;
}
```

### Events
`auto-complete:selected` is fired after an option is selected. You can find which option was selected
by:

```js
const autocomplete = document.querySelector('auto-complete');

autocomplete.addEventListener('auto-complete:selected', (event) => {
  const option = event.detail.relatedTarget;
  console.log(option);
});
```

`auto-complete:reset` is fired after `data-autocomplete-reset` has been clicked.

## License
Distributed under the MIT license.

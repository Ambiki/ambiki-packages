# Auto Complete Element

Single and multi auto-complete component.

## Installation

```bash
npm install @ambiki/auto-complete-element
```

## Usage

```js
import '@ambiki/auto-complete-element';
```

### Markup

```html
<auto-complete for="list">
  <input type="text" />
  <ul id="list" hidden>
    <li id="1" role="option">Option 1</li>
    <li id="2" role="option">Option 2</li>
    <li id="3" role="option">Option 3</li>
  </ul>
</auto-complete>
```

### `auto-complete` attributes

#### `multiple`

You can set the `multiple` attribute on the `<auto-complete>` to allow selections on multiple options.

```html
<auto-complete for="list" multiple>
  <input type="text" />
  <ul id="list" hidden>
    <li id="1" role="option">Option 1</li>
    <li id="2" role="option">Option 2</li>
    <li id="3" role="option">Option 3</li>
  </ul>
</auto-complete>
```

#### `value`

When an `option` is selected, the `auto-complete` element adds a `value` attribute. The type of `value` depends on
whether the `auto-complete` is a single-select or a multi-select.

- Single-select

  ```html
  <auto-complete value='{ "id": "1", "value": "Option 1" }'>
    <!-- markup -->
  </auto-complete>
  ```

- Multi-select

  ```html
  <auto-complete value='[{ "id": "1", "value": "Option 1" }, { "id": "2", "value": "Option 2" }]'>
    <!-- markup -->
  </auto-complete>
  ```

In both the above cases, `id` is the `id` of an `option` and `value` is the `innerText` or `data-autocomplete-value`
attribute of an `option` item.

You can also use the `value` attribute to set the initially selected options either by inlining or via `JavaScript`.
Here's how you can do it with `JavaScript`,

```js
const autocomplete = document.querySelector('auto-complete');

if (autocomplete.multiple) {
  autocomplete.value = [{ id: '1', value: 'Player' }];
} else {
  autocomplete.value = { id: '1', value: 'Player' };
}
```

[See full list of API](./src/index.ts)

#### `src`

You can specify an endpoint to load the `option`s from.

```html
<auto-complete for="users" src="/users">
  <input type="text" />
  <ul id="users" hidden></ul>
</auto-complete>
```

The server response should return the `option`s that matched the search query.

```html
<li id="1" role="option">Taxi</li>
<li id="2" role="option">Player</li>
```

#### `param`

By default, the `auto-complete` element adds a `q` query param when making a network request (`/users?q=search_term`).
You can change this by setting the `param` attribute on the `auto-complete` element.

```html
<auto-complete src="/users" param="search">
  <!-- markup -->
</auto-complete>
```

**Note:** This is only applicable when the `src` attribute is present on the `auto-complete` element.

#### `max`

You can set the `max` attribute on the `<auto-complete>` to restrict a fixed number of selections. This only works if
the element has a `multiple` attribute set.

```html
<auto-complete for="list" multiple max="2">
  <!-- markup -->
</auto-complete>
```

### List container attributes

#### `data-empty`

This attribute is added to the list container when the search results are empty. You can use CSS to show/hide the
blank slate like this:

```html
<auto-complete for="list">
  <input type="text" />
  <ul id="list" class="container" hidden>
    <li id="1" role="option">Option 1</li>
    <li role="presentation" class="blankslate">No results found!</li>
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

### Option attributes

#### `aria-selected`

`aria-selected="true"` is set on the selected option which can be used to differentiate the selected elements from the
non-selected elements visually via CSS.

```html
<auto-complete for="list" value='{ "id": "1", "value": "Option 1" }'>
  <input type="text" />
  <ul id="list" hidden>
    <li id="1" role="option" data-autocomplete-value="Option 1" aria-selected="true">
      Option 1
      <span>(selected)</span>
    </li>
    <li id="2" role="option" data-autocomplete-value="Option 2">
      Option 2
      <span>(selected)</span>
    </li>
  </ul>
</auto-complete>
```

```css
li[role='option'] > span {
  display: none;
}

li[role='option'][aria-selected='true'] > span {
  display: inline-block;
}
```

#### `data-autocomplete-value`

The default filtering logic is a substring. The `data-autocomplete-value` can be used to customize the search term.

```html
<li id="1" role="option" data-autocomplete-value="Battlestar">Option</li>
```

### Clear button

Add the `data-autocomplete-clear` attribute to an HTML element. Clicking on it would clear out all selections and remove
the `value` attribute from the `auto-complete` element.

```html
<auto-complete for="list">
  <input type="text" />
  <button type="button" data-autocomplete-clear>Clear</button>

  <ul id="list" hidden>
    <li id="1" role="option">Option 1</li>
  </ul>
</auto-complete>
```

### Events

- `auto-complete:show` is fired immediately after removing the `hidden` attribute.
- `auto-complete:shown` is fired after attaching the combobox functionality.
- `auto-complete:hide` is fired immediately after adding the `hidden` attribute.
- `auto-complete:hidden` is fired after removing the combobox functionality.
- `auto-complete:commit` is fired after an option is selected. You can find which option was selected by:

  ```js
  const autocomplete = document.querySelector('auto-complete');

  autocomplete.addEventListener('auto-complete:commit', (event) => {
    const option = event.detail.relatedTarget;
    console.log(option);
  });
  ```

- `auto-complete:clear` is fired after `[data-autocomplete-clear]` element has been clicked.

  When the `src` attribute is present,

  - `auto-complete:loadstart` is fired when the server fetch has started.
  - `auto-complete:success` is fired when the network request has completed successfully.
  - `auto-complete:error` is fired when the network request has failed.
  - `auto-complete:loadend` is fired then the network request has completed.

## License

Distributed under the MIT license.

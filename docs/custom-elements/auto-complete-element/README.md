---
tags:
  - autocomplete
  - ajax
  - select menu
---

# Auto Complete Element

Single and multi auto-complete component.

## Installation

<code-group>
  <code-block title="YARN">
  ```bash
  yarn add @ambiki/combobox
  yarn add @ambiki/auto-complete-element
  ```
  </code-block>

  <code-block title="NPM">
  ```bash
  npm install @ambiki/combobox
  npm install @ambiki/auto-complete-element
  ```
  </code-block>
</code-group>

After installing,

```js
import '@ambiki/auto-complete-element';
```

## Examples

Click on the input field to open the list.

<component-box>
  <guides-auto-complete />
</component-box>

```html
<auto-complete for="list">
  <input type="text" />
  <ul id="list" hidden>
    <li role="option" value="player">Player</li>
    <li role="option" value="taxi">Taxi</li>
  </ul>
</auto-complete>
```

### Starting with a selected option

Add `value` attribute on the `auto-complete` element that matches one of the options' `value` attribute.

<component-box>
  <guides-auto-complete value="taxi" />
</component-box>

```html{1}
<auto-complete for="list" value="taxi">
  <input type="text" />
  <ul id="list" hidden>
    <li role="option" value="player">Player</li>
    <li role="option" value="taxi">Taxi</li>
  </ul>
</auto-complete>
```

### Clear button

Add `data-clear` attribute on a button element and it will automatically deselect the selected option. Click on the
"X" button to deselect the option.

<component-box>
  <guides-auto-complete value="taxi" show-clear-btn />
</component-box>

```html{3}
<auto-complete for="list" value="taxi">
  <input type="text" />
  <button type="button" data-clear>X</button>
  <ul id="list" hidden>
    <li role="option" value="player">Player</li>
    <li role="option" value="taxi">Taxi</li>
  </ul>
</auto-complete>
```

::: tip
We automatically set `aria-label="Clear autocomplete"` on the clear button, however, this can be overridden by
setting a custom `aria-label` attribute.
:::

### Showing a blankslate

Try searching for an option that does not exist within the list.

<component-box>
  <guides-auto-complete />
</component-box>

<code-group>
  <code-block title="HTML">
  ```html{7}
  <auto-complete for="list" value="taxi">
    <input type="text" />
    <button type="button" data-clear>X</button>
    <ul id="list" hidden>
      <li role="option" value="player">Player</li>
      <li role="option" value="taxi">Taxi</li>
      <li class="blankslate">Blankslate</li>
    </ul>
  </auto-complete>
  ```
  </code-block>

  <code-block title="CSS">
  ```css
  .blankslate {
    display: none;
  }

  auto-complete[data-empty] .blankslate {
    display: inline;
  }
  ```
  </code-block>
</code-group>

::: tip
We add `data-empty` attribute on the `auto-complete` element if there aren't any matching results. You can use CSS
to show/hide a blankslate based on it.
:::

### Disabling an option

Use the `disabled` or set `aria-disabled="true"` on the option element. This will make it unselectable via mouse
or a keyboard. However, it will not be skipped when navigating via ArrowUp/ArrowDown keys.

<component-box>
  <guides-auto-complete-with-disabled-options />
</component-box>

```html{5,7}
<auto-complete for="list">
  <input type="text" />
  <ul id="list" hidden>
    <li role="option" value="melbourne">Melbourne</li>
    <li role="option" value="sydney" disabled>Sydney</li>
    <li role="option" value="new-york">New York</li>
    <li role="option" value="texas" aria-disabled="true">Texas</li>
  </ul>
</auto-complete>
```

### Multiple selections

Add `multiple` attribute on the `auto-complete` element to allow multiple options to be selected. This will keep
the list open when you are selecting options, and selecting an option will toggle its selected state.

<component-box>
  <guides-auto-complete multiple />
</component-box>

```html{1}
<auto-complete for="list" multiple>
  <input type="text" />
  <ul id="list" hidden>
    <li role="option" value="player">Player</li>
    <li role="option" value="taxi">Taxi</li>
  </ul>
</auto-complete>
```

::: warning
To start with selected options, you need to pass an array of values that match the options' value to the `value`
attribute.
:::

<component-box>
  <guides-auto-complete multiple :value="['player', 'taxi']" />
</component-box>

```html{1}
<auto-complete for="list" value="['player', 'taxi']" multiple>
  <input type="text" />
  <ul id="list" hidden>
    <li role="option" value="player">Player</li>
    <li role="option" value="taxi">Taxi</li>
  </ul>
</auto-complete>
```

### Asynchronous requests

Add `src` attribute on the `auto-complete` element to make a network request when the input field is populated. Your
server should respond with the options that matched the query.

<component-box>
  <guides-auto-complete-with-async />
</component-box>

```html{1}
<auto-complete for="list" src="/users">
  <input type="text" />
  <ul id="list" hidden></ul>
</auto-complete>
```

::: tip
By default, request is made with the URL `/users?q=query-value`. This can be changed by setting the `param` attribute
on the `auto-complete` element.
::: details Click to view the code
```html{1}
<auto-complete for="list" src="/users" param="query">
  <!-- code -->
</auto-complete>
```
:::

#### Starting with a selected option

Since it's not possible to determine the display value of the selected option, you need to pass `data-label` attribute
to the `auto-complete` element so that the input field is properly filled with the display value.

<component-box>
  <guides-auto-complete-with-async value="1" data-label="Wade Cooper" />
</component-box>

```html{1}
<auto-complete for="list" src="/users" value="1" data-label="Wade Cooper">
  <input type="text" />
  <ul id="list" hidden></ul>
</auto-complete>
```

> **Note:** This step is not required for [multi-select](#multiple-selections) `auto-complete` element.

## Integrating with third-party JS frameworks

The `auto-complete` element fires multiple [events](#events) that you can access to build components that fit your
need. In this example, we'll be using [vuejs](https://vuejs.org/) to build a [token-style](https://mui.com/material-ui/react-autocomplete/#multiple-values)
component.

<component-box>
  <guides-auto-complete-with-tokens />
</component-box>

> See [source code](https://github.com/Ambiki/ambiki-packages/blob/main/docs/.vuepress/components/guides/auto-complete/with-tokens.vue)
> on GitHub.

## Attributes

| Name         | Description                                                                        |
|--------------|------------------------------------------------------------------------------------|
| `open`       | Added to the `auto-complete` element when the list is open.                        |
| `value`      | Used to set the selected value.                                                    |
| `data-label` | Used to set the display value of the selected option on the input field.           |
| `data-empty` | Added to the `auto-complete` element when there are no options matching the query. |
| `param`      | Used the change the query param when making a network request.                     |
| `loading`    | Added to the `auto-complete` element when it is making a network request.          |

## Events

| Name                      | Description                                                                                                                                               |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `auto-complete:show`      | Fired before the list is shown.                                                                                                                           |
| `auto-complete:shown`     | Fired after the list is shown.                                                                                                                            |
| `auto-complete:hide`      | Fired before the list is hidden.                                                                                                                          |
| `auto-complete:hidden`    | Fired after the list is hidden.                                                                                                                           |
| `auto-complete:select`    | Fired after the option has been selected. You can access the selected `option`, `label`, and `value` from the `detail` property of the event.             |
| `auto-complete:deselect`  | Fired after the option has been deselected. You can access the deselected `option`, `label`, and `value` from the `detail` property of the event.         |
| `auto-complete:commit`    | Fired after the option has been selected/deselected. You can access the committed `option`, `label`, and `value` from the `detail` property of the event. |
| `auto-complete:clear`     | Fired after the [clear button](#clear-button) has been clicked.                                                                                           |
| `auto-complete:loadstart` | Fired when the network request has started.                                                                                                               |
| `auto-complete:success`   | Fired when the network request has completed successfully.                                                                                                |
| `auto-complete:error`     | Fired when the network request has failed.                                                                                                                |
| `auto-complete:loadend`   | Fired when the network request has finished.                                                                                                              |

## API

Given the following markup:

```html
<auto-complete for="list">
  <input type="text" />
  <ul id="list" hidden>
    <li role="option" value="player">Player</li>
  </ul>
</auto-complete>
```

```js
const container = document.querySelector('auto-complete');
const autocomplete = container.autocomplete;
```

### `open`

Whether the list is open or not.

```js
container.open;
// => false
```

### `open=`

Shows/hides the list.

```js
container.open = true;
```

### `multiple`

Whether multiple options can be selected or not.

```js
container.multiple;
// => false
```

### `multiple=`

Set where multiple options can be selected or not.

```js
container.multiple = true;
```

### `src`

Returns the `src` attribute of the `auto-complete` element.

```js
container.src;
// => /users
```

### `src=`

Set the `src` attribute of the `auto-complete` element.

```js
container.src = '/people';
```

### `param`

Returns the query param name.

```js
container.param;
// => 'q'
```

### `param=`

Sets the `param` attribute of the `auto-complete` element.

```js
container.param = 'query';
```

### `value`

Returns all the selected options' value.

```js
container.value;
// => ['1', '2']
```

### `setValue`

Resets the selected options to the given value.

```js
autocomplete.setValue([{ value: 1 }, { value: 2 }]);
```

In case of single-select where options are fetched over a [network request](#asynchronous-requests), you can pass
`label` to set the input field's value.

```js
autocomplete.setValue([{ value: 1, label: 'Selected option' }]);
```

### `removeValue`

Removes the selected option that matches the provided value.

```js
autocomplete.removeValue('foo');
```

### `activate`

Adds `data-active` attribute on the option element and sets `aria-activedescendant` attribute on the input element.

```js
autocomplete.activate(option);
```

::: tip
You can also scroll to the activated option by setting `scroll: true`. By default, it's `false`.

```js
autocomplete.activate(option, { scroll: true });
```
:::

### `deactivate`

Removes `data-active` attribute from the option element and removes `aria-activedescendant` attribute from the input
element.

```js
autocomplete.deactivate();
```

### `clear`

Deselects all the selected options and closes the list.

```js
autocomplete.clear();
```

### `options`

Returns all the options of the `auto-complete` element.

```js
autocomplete.options;
```

### `visibleOptions`

Returns all the options of the `auto-complete` element that are visible within the list.

```js
autocomplete.visibleOptions;
```

### `activeOption`

Returns the option that has the `data-active` attribute.

```js
autocomplete.activeOption;
```

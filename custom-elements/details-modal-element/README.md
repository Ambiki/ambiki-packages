# Details Modal Element

A modal component that works with the `<details>` tag.

## Installation

```bash
npm install @ambiki/details-modal-element
```

## Usage

```js
import '@ambiki/details-modal-element'
```

### Markup

```html
<details>
  <summary>Open dialog</summary>
  <details-modal>
    <p>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
    </p>
  </details-modal>
</details>
```

Initial focus can be changed with the `autofocus` attribute.

```html
<details>
  <summary>Open dialog</summary>
  <details-modal>
    <input type="text" autofocus>
  </details-modal>
</details>
```

### Closing the modal

Modal can be closed using the `data-modal-close` attribute.

```html
<button type="button" data-modal-close>Close modal</button>
```

Modal can also be closed using the `method="dialog"` attribute on the `<form>`.

```html
<details>
  <summary>Open dialog</summary>
  <details-modal>
    <form method="dialog">
      <button type="submit">Close modal</button>
    </form>
  </details-modal>
</details>
```

## License
Distributed under the MIT license.

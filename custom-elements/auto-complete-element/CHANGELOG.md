# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Support `name` attribute. If present, proper `input[type="hidden"][name="some_name"]` will be appended inside the
  `auto-complete` element with `value` being the selected option's `value` attribute.
- Reset `auto-complete` when parent `form` element fires a `reset` event.

## [2.0.1] - 2023-03-02

### Added

- Export `types` from `index.ts` file

### Fixed

- List does not close when clicking outside on Safari

## [2.0.0] - 2023-02-28

### Changed

- Rewrite package. Visit documentation https://ambiki.github.io/ambiki-packages/custom-elements/auto-complete-element.

## [1.0.0] - 2022-11-24

### Added

- Fetch options remotely with the `src` attribute

  ```html
  <auto-complete for="users" multiple src="/users">
    <input type="text" class="form-control" />
    <ul id="users" hidden></ul>
  </auto-complete>
  ```

  This makes a request to `/users?q=query` endpoint with `query` being the search term. Search param can be changed by
  setting a `param` attribute on the auto-complete element

- Users can update or watch for `value` attribute changes. Single-select auto-complete element sets a stringified object
  whereas multi-select sets a stringified array of objects

  ```html
  <auto-complete value='{ "id": "1", "value": "Some value" }'>
    <!-- markup -->
  </auto-complete>
  ```

- Support for initially selected options

  - Single

    ```html
    <auto-complete value='{ "id": "1", "value": "Some value" }'>
      <!-- markup -->
    </auto-complete>
    ```

  - Multiple
    ```html
    <auto-complete multiple value='[{ "id": "1", "value": "Some value" }, { "id": "2", "value": "Another value" }]'>
      <!-- markup -->
    </auto-complete>
    ```

### Changed

- Renamed `auto-complete:selected` event to `auto-complete:commit`
- Renamed `auto-complete:reset` event to `auto-complete:clear`
- Renamed `data-autocomplete-reset` attribute to `data-autocomplete-clear`

## [0.3.0] - 2022-11-11

### Added

- Support `max` attribute for multi-select

### Changed

- Make `activateFirstOption` API public

### Fixed

- Auto complete does not close when clicking outside on Firefox
- `data-empty` not added after opening when list is empty

## [0.2.0] - 2022-07-18

### Added

- Allow clicking inside the list
- Fire events such as `auto-complete:show`, `auto-complete:shown`, `auto-complete:hide`, and `auto-complete:hidden`

## [0.1.2] - 2022-06-18

### Fixed

- Auto complete queries for `<input type="hidden">` elements

## [0.1.1] - 2022-06-18

### Changed

- Changed bundle format from `CommonJS` to `ECMAScript module`

## [0.1.0] - 2022-06-15

### Added

- Everything!

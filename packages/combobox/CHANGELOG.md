# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Ureleased]

### Changed

- `setInitialAttributesOnOptions` API takes an array of selected option ids (`string[]`)
- All selected options are unselected when combobox is stopped

## [1.0.0] - 2022-11-11

### Added

- Support `max` option for multi-select

### Changed

- `isMultiple` renamed to `multiple`
  ```js
  new Combobox(input, list, { multiple: true });
  ```

## [0.1.1] - 2022-07-18

### Fixed

- `list` scrolls automatically when hovering on the options

## [0.1.0] - 2022-06-15

### Added

- Everything!

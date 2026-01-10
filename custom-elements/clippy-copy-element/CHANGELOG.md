# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-01-10

### Added
- Support for `data-prefix-value` and `data-suffix-value` attributes on `<clippy-copy>` to allow customizing clipboard output.
- Clipboard text can now be composed from a prefix, the target or value, and a suffix before being copied.

### Changed
- Copy behavior now always resolves to a single constructed string before writing to the clipboard, allowing extensions without breaking existing usage.

## [0.1.0] - 2022-06-13

### Added
- Everything!

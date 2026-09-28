# Changelog

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org). See
[RELEASE.md](../../RELEASE.md) for what counts as a major, minor or patch change.

## [Unreleased]

### Changed

- **BREAKING:** The minimum supported Node.js version is now 22. It was 16.19,
  which had not been accurate for some time: several dependencies already
  required Node 18 or later.

### Fixed

- `formatter` no longer relies on an implicit `this` binding inside an
  `Array.prototype.find` callback.

# Changelog

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org). See
[RELEASE.md](../../RELEASE.md) for what counts as a major, minor or patch change.

## [Unreleased]

### Fixed

- Declares `@beatoz/web3-accounts`, `@beatoz/web3-errors` and `xstream`, which
  it imports but did not list. Installing this package on its own could fail at
  load. `xstream` appears only in emitted `.d.ts` files, but a consumer
  type-checking those declarations has to resolve it, so it is a runtime
  dependency rather than a development one.

  This was hidden by the monorepo: every dependency was hoisted to one
  `node_modules`, so these imports resolved here and only here.

### Changed

- **BREAKING:** The minimum supported Node.js version is now 22. It was 16.19,
  which had not been accurate for some time: several dependencies already
  required Node 18 or later.

### Added

- Declares `typescript: ">=5.4"` as an optional peer dependency. No supported
  compiler range was declared before.

# Changelog

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org). See
[RELEASE.md](../../RELEASE.md) for what counts as a major, minor or patch change.

## [Unreleased]

### Fixed

- Declares `@beatoz/web3-abi`, `@beatoz/web3-accounts`, `@beatoz/web3-errors`,
  `@beatoz/web3-providers-ws`, `@beatoz/web3-rpc`, `@beatoz/web3-types` and
  `@beatoz/web3-utils`, which it imports but did not list. Installing this
  package on its own could fail at load.

  This was hidden by the monorepo: every dependency was hoisted to one
  `node_modules`, so these imports resolved here and only here.

### Changed

- **BREAKING:** The minimum supported Node.js version is now 22. It was 16.19,
  which had not been accurate for some time: several dependencies already
  required Node 18 or later.

### Added

- Declares `typescript: ">=5.4"` as an optional peer dependency. No supported
  compiler range was declared before.

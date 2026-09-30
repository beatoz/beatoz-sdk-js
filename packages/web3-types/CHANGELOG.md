# Changelog

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org). See
[RELEASE.md](../../RELEASE.md) for what counts as a major, minor or patch change.

## [Unreleased]

### Fixed

- Declares `bn.js`, which it imports but did not list. Installing this package
  into an empty project and requiring it raised `Cannot find module 'bn.js'`.

- Now resolves `bn.js` 5.x, the version its sibling packages already declared.
  While the dependency was undeclared it resolved to the hoisted 4.12.5 that
  `ethereumjs-util` pulls in. `BN` does not appear in this package's public
  declarations, so no API changes.

  This was hidden by the monorepo: every dependency was hoisted to one
  `node_modules`, so these imports resolved here and only here.

### Changed

- **BREAKING:** The minimum supported Node.js version is now 22. It was 16.19,
  which had not been accurate for some time: several dependencies already
  required Node 18 or later.

### Added

- Declares `typescript: ">=5.4"` as an optional peer dependency. No supported
  compiler range was declared before.

### Changed

- **BREAKING:** `TrxProto` gains `payer` and `payerSig`, the fee delegation
  fields the chain added in June 2025. Code that builds a `TrxProto` literal
  must set them; empty `Uint8Array`s mean "sender pays" and are omitted from
  the wire, so encoded bytes are unchanged.

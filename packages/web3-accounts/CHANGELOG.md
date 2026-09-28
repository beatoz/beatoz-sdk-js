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

### Added

- `privateKeyToAccount`, `privateKeyToPrvKey` and `sign` accept a `Uint8Array`
  private key. They previously declared `HexString | ArrayBufferLike`, which
  excluded the most common way to hold key bytes.
- Declares `typescript: ">=5.4"` as an optional peer dependency. No
  supported compiler range was declared before.

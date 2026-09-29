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

### Fixed

- The ESM build could not be imported. The generated protobuf code imported
  `protobufjs/minimal` without an extension, which `require()` resolves and
  ESM does not, so the module failed with `ERR_MODULE_NOT_FOUND`.

### Changed

- `src/tx/trx_pb.proto` is now a verbatim copy of the chain's
  `protos/trx.proto`. The copy in this repository had been edited after
  generation: `TrxPayloadProposalProto` field numbers were renumbered and the
  fee delegation fields were missing. The generated code carried the chain's
  numbers, so nothing on the wire changes.
- **BREAKING:** Transaction builders set `payer` and `payerSig` on the objects
  they return, following the `TrxProto` change in `@beatoz/web3-types`.

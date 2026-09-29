# Changelog

All notable changes across the `@beatoz/*` packages are documented in this file.
Each package also keeps its own `packages/<name>/CHANGELOG.md`, which is the one
to read when upgrading a single package.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org). See
[RELEASE.md](./RELEASE.md) for what counts as a major, minor or patch change.

## [Unreleased]

Work towards v2. Package versions become independent with this release, so the
entries below name the packages they apply to.

### Changed

- **BREAKING:** The minimum supported Node.js version is now 22, across all
  packages. It was 16.19, which had not been accurate for some time: several
  dependencies already required Node 18 or later, so installs on Node 16 were
  already failing in ways the declared range did not explain.

- **BREAKING:** `@beatoz/web3-types`: `TrxProto` gains `payer` and `payerSig`,
  the fee delegation fields the chain added in June 2025. Code that builds a
  `TrxProto` literal must set them; empty values mean "sender pays" and are
  omitted from the wire, so encoded bytes are unchanged.

- `@beatoz/web3-accounts`: `src/tx/trx_pb.proto` is now a verbatim copy of the
  chain's `protos/trx.proto`. The copy here had been edited after generation -
  proposal field numbers renumbered, fee delegation fields missing - while the
  generated code carried the chain's numbers.

- **BREAKING:** Package versions are no longer released in lockstep. Each
  package now carries its own version. Under the previous scheme every package
  was republished whenever any package changed, so a version number did not
  indicate whether that package had changed.

### Added

- Every package now declares `typescript: ">=5.4"` as an optional peer
  dependency. Nothing declared a supported compiler range before. It is
  optional so a JavaScript consumer is not asked to install TypeScript.

- `@beatoz/web3-accounts`: `privateKeyToAccount`, `privateKeyToPrvKey` and
  `sign` accept a `Uint8Array` private key. They previously declared
  `HexString | ArrayBufferLike`, which excluded the most common way to hold key
  bytes.

### Fixed

- `@beatoz/web3-accounts`: the ESM build could not be imported. The generated
  protobuf code imported `protobufjs/minimal` without an extension, which
  `require()` resolves and ESM does not.

- `@beatoz/web3-utils`: `formatter` no longer relies on an implicit `this`
  binding inside an `Array.prototype.find` callback.

### Changed (build and test only)

These do not change the published output, and are listed because they explain
the version jump.

- Build toolchain moved to TypeScript 6.0.3 from 4.9.5, with
  `moduleResolution: bundler`. The published output is unchanged.
- Lint toolchain moved to ESLint 10 flat config. The previous configuration
  never extended `js.configs.recommended` and never registered the import
  plugin, so circular-import checking had never run.
- Dependency baseline pinned (`@types/minimatch`, `webpack`) and `yarn.lock`
  brought under version control.
- `lerna bootstrap` removed; it duplicated Yarn workspaces and was dropped
  upstream in Lerna 7.
- Tests split into `test/unit` and `test/integration`. The unit layer runs
  without a node. Integration configuration moved to environment variables;
  the two gitignored JSON files it used to import are gone.

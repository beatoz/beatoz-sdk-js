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

- **BREAKING:** Every package now has an `exports` map, so only the package
  root and its `package.json` can be imported. Deep paths such as
  `@beatoz/web3-types/lib/commonjs/integers` now fail with
  `ERR_PACKAGE_PATH_NOT_EXPORTED`. Everything under `lib/` used to be
  reachable, which meant the whole build output was public API and no internal
  file could be moved or renamed without risk. Nothing in this repository or in
  the four internal consumers imported a deep path.

  `./package.json` stays reachable because build tools read it.

- Every package now declares `types`. Type resolution previously relied on
  `index.d.ts` happening to sit next to the file named by `main`.

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

- Five packages did not declare dependencies they import, so installing any one
  of them on its own failed at load. Installing `@beatoz/web3-types` into an
  empty project and requiring it raised `Cannot find module 'bn.js'`. The
  monorepo hid this: every dependency was hoisted to one `node_modules`, so the
  imports resolved here and only here. Now declared:

  | Package | Now declares |
  | --- | --- |
  | `@beatoz/web3` | `web3-abi`, `web3-accounts`, `web3-errors`, `web3-providers-ws`, `web3-rpc`, `web3-types`, `web3-utils` |
  | `@beatoz/web3-contract` | `web3-abi`, `web3-errors`, `web3-providers-http`, `web3-providers-ws`, `web3-validator` |
  | `@beatoz/web3-methods` | `web3-accounts`, `web3-errors`, `xstream` |
  | `@beatoz/web3-core` | `web3-errors`, `xstream` |
  | `@beatoz/web3-types` | `bn.js` |

  `xstream` appears only in emitted `.d.ts` files, but a consumer type-checking
  those declarations has to resolve it, so it is a runtime dependency rather
  than a development one.

- `@beatoz/web3-types`: now resolves `bn.js` 5.x, the version its sibling
  packages already declared. Because the dependency was undeclared it had been
  resolving to the hoisted 4.12.5 that `ethereumjs-util` pulls in, a different
  major version from the one `@beatoz/web3-utils` and `@beatoz/web3-accounts`
  use. `BN` does not appear in this package's public declarations, so no API
  changes.

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

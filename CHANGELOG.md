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

### Added

- Every package now has a `files` field, so a published package carries
  `lib/`, `src/`, `CHANGELOG.md`, `README.md`, `LICENSE` and `package.json`,
  and nothing else. Build leftovers no longer ship: `tsconfig.types.json`,
  `tsdoc.json` - which extended a file that was never published, so it could
  not be read where it landed - and the `.tsbuildinfo` incremental build
  caches, which record absolute paths from the machine that built them.

- Every package now ships `src/`. The source maps have always pointed at
  `../../src/*.ts`, but those files were not published, so a debugger could not
  open the line a stack trace named. A stack trace already reported the right
  `.ts` file and line without this, under `--enable-source-maps`; what `src/`
  adds is being able to read that line, and having "Go to Definition" land on
  the implementation instead of stopping at the `.d.ts`. v2 is still moving
  quickly and reading the source is part of using it.

- Every package now ships `LICENSE`. All thirteen declared `Apache-2.0` while
  publishing no copy of the license text.

### Removed

- **BREAKING:** `@beatoz/web3-types` no longer exports
  `Web3BaseProviderConstructor`. Its `net?: Socket` parameter was the only reason
  this package's declarations imported Node's `net` module, which forced every
  consumer - browser ones included - to install `@types/node` or hit
  `error TS2307: Cannot find module 'net'`. It is the signature of web3.js's IPC
  provider, and this SDK has no IPC provider. Nothing in this repository or in
  the four internal consumers referenced it.

- **BREAKING:** The `eth_subscribe` subscription subsystem is gone - 509 lines
  that could not run. `@beatoz/web3-core` loses `Web3Subscription`,
  `Web3SubscriptionManager`, `Web3SubscriptionConstructor` and
  `isSupportSubscriptions`; `@beatoz/web3-contract` loses `LogsSubscription`,
  `ContractBoundEvent` and `ContractEventsInterface`.

  It is web3.js's machinery, ported without `sendSubscriptionRequest()` - the
  method that assigns a subscription its id from the `eth_subscribe` response.
  `_id` was never set to anything but `undefined`, and `addSubscription()` opens
  with `if (isNullish(sub.id)) throw`, so every call threw. Nothing ever
  populated `registeredSubscriptions`, and `Contract` has no `events` property,
  so the contract half was unreachable too.

  **Subscriptions still work.** `web3.beatoz.subscribe()`,
  `subscribeNewBlock()`, `subscribeNewBlockHeader()` and `subscribeTx()` return
  an xstream `Stream` over the websocket provider, and that path is untouched.
  This release removes the half that never did.

- **BREAKING:** 22 declared dependencies that no package imported are gone. The
  largest is `web3` itself: `@beatoz/web3-contract` depended on the upstream
  web3.js package while the only mention of it in the source was a
  `require('web3-eth-contract')` line inside a JSDoc example. Installing
  `@beatoz/web3-contract` into an empty project drops from 138 packages and
  86 MB to 105 and 32 MB.

  | Package | No longer depends on |
  | --- | --- |
  | `@beatoz/web3-contract` | `web3` |
  | `@beatoz/web3-utils` | `bn.js`, `crypto-js`, `@types/crypto-js`, `protobufjs`, `ts-proto`, `constants-browserify`, `crypto-browserify`, `path-browserify` |
  | `@beatoz/web3-accounts` | `crypto-js`, `@types/crypto-js`, `constants-browserify`, `crypto-browserify`, `path-browserify` |
  | `@beatoz/web3-rpc` | `@beatoz/web3-utils`, `@beatoz/web3-validator` |
  | `@beatoz/web3-abi` | `@beatoz/web3-rpc` |
  | `@beatoz/web3-core` | `@beatoz/web3-validator` |
  | `@beatoz/web3-methods` | `@beatoz/web3-utils` |
  | `@beatoz/web3-providers-ws` | `@beatoz/web3-errors` |
  | `@beatoz/web3-validator` | `util` |

  Removing a dependency is breaking because a consumer may have been reaching it
  through us rather than declaring it themselves.

  Three declarations that look unused are kept, because a text search is not
  what decides: `ws` in `@beatoz/web3-providers-ws` is a peer dependency of
  `isomorphic-ws`; `@types/crypto-js` in `@beatoz/web3-types` is needed because
  that package's public `.d.ts` imports `crypto-js`, which ships no types of its
  own; and the `*-browserify` packages are webpack polyfills resolved by this
  repository's browser build, so they move to the root rather than disappearing.

- `ts-proto` moved from `dependencies` to `devDependencies` in
  `@beatoz/web3-accounts`. It provides the `protoc-gen-ts_proto` binary that
  regenerates `trx_pb.ts`; consumers never regenerate protobuf code.

- `.npmignore` is gone, from every package and from the repository root.
  `files` takes precedence over it, so keeping both would leave fourteen files
  that look like they decide what ships but no longer do. The root one had also
  been reaching into the workspace packages: it listed `src/`, which is why no
  package published its sources even though no package's own `.npmignore`
  excluded them.

- **BREAKING:** The CommonJS build is gone. `lib/commonjs` is no longer built
  or published, and every package ships ESM only. This halves what is
  published: `@beatoz/web3-types` goes from 214 files and 588 kB unpacked to
  124 files and 347 kB.

  Node 22.12 and later can `require()` an ES module, which is why the minimum
  supported Node moves from 22.0 to 22.12. A CommonJS consumer on a supported
  Node keeps working without source changes:

  ```js
  require('@beatoz/web3')   // still resolves, via require(esm)
  ```

  The `exports` map uses a `default` condition rather than `import`, so the
  `require` condition matches it too. Pointing `exports` at `import` alone
  would reject `require()` outright rather than fall through to it.

  Every comparable SDK still ships both builds - ethers, viem, `@cosmjs/*`,
  `@solana/web3.js` - because they support Node 18 and 20, where `require(esm)`
  does not exist. Having already set the floor at Node 22, we do not.

  A bundler or a TypeScript setup pinned to an older Node resolution mode may
  still need updating.

- **BREAKING:** The `module` field is gone and `main` now points at the ESM
  entry. Both described the same build.

### Changed

- **BREAKING:** The minimum supported Node.js version is now 22.12, across all
  packages. It was 16.19, which had not been accurate for some time: several
  dependencies already required Node 18 or later, so installs on Node 16 were
  already failing in ways the declared range did not explain. The 22.12 floor
  in particular is what makes `require()` of this ESM-only build work.

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

- **BREAKING:** Package versions are no longer locked to a single number.
  `lerna.json` is set to `independent`, so each package can carry its own
  version. Under the previous scheme every package was republished whenever any
  package changed, so a version number did not indicate whether that package had
  changed.

  This release still moves all thirteen packages to the same number, because
  every one of them has a breaking change in it. What changes is what happens
  afterwards: a fix to `@beatoz/web3-utils` moves that package alone, and the
  other twelve keep the number they were released at. Internal dependencies use
  caret ranges, so a dependent accepts the new patch without being republished.
  See [RELEASE.md](./RELEASE.md) for the operating rule.

### Added

- Every package now declares `typescript: ">=5.4"` as an optional peer
  dependency. Nothing declared a supported compiler range before. It is
  optional so a JavaScript consumer is not asked to install TypeScript.

- `@beatoz/web3-accounts`: `privateKeyToAccount`, `privateKeyToPrvKey` and
  `sign` accept a `Uint8Array` private key. They previously declared
  `HexString | ArrayBufferLike`, which excluded the most common way to hold key
  bytes.

### Fixed

- No published declaration refers to a Node-only type any more, so consumers do
  not need `@types/node` to read them. Three places leaked one:

  | Package | Was | Now |
  | --- | --- | --- |
  | `@beatoz/web3-core` | `removeAllListeners(): EventEmitter<[never]>` | `removeAllListeners(): void` |
  | `@beatoz/web3-utils` | `[NodeJS.Timer, …]` | `[ReturnType<typeof setTimeout>, …]` |
  | `@beatoz/web3-utils` | `constructor(eventEmitter: EventEmitter, …)` | `constructor(eventEmitter: ChunkEventSink, …)` |

  The first was not written by anyone: `removeAllListeners()` had no declared
  return type, so TypeScript inferred one from the body and published it. That
  is why this class of problem cannot be caught by reading the sources - it only
  appears in the emitted `.d.ts`.

  A browser consumer was carrying Node's type definitions because of these three
  lines, and on TypeScript 6 - which no longer includes `@types/*` packages
  automatically - had to add `"types": ["node"]` to their own `tsconfig.json`.
  Neither is needed now.

- The published type declarations now follow ES module rules, finishing the move
  to ESM. Two things were wrong, and both were invisible at runtime:

  `lib/types/` had no `package.json` marking it as ESM, so a consumer's compiler
  read the `.d.ts` files as CommonJS while the `.js` beside them was ESM. The
  build now writes that marker, the same way it already did for `lib/esm/`.

  9 of 245 relative imports in the sources were missing their `.js` extension.
  All nine were type-only, so `tsc` erased them from the emitted `.js` and every
  runtime check passed - but they survive in the emitted `.d.ts`, where a
  consumer on `moduleResolution: node16` or `nodenext` hit `error TS2834`.

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
- `typescript`, `jest`, `@types/jest`, `jest-extended` and `prettier` are
  declared once at the repository root instead of in all thirteen packages.
  That was 60 lines pinning versions that decided nothing: Yarn hoists a single
  copy of each to the root `node_modules`, and every package already resolved
  that one. The declarations were inert only because all thirteen happened to
  agree - the moment one differed, Yarn would install a nested copy and that
  package really would build with a different compiler, which is what
  `crypto-browserify` is doing in `web3-accounts` and `web3-utils` today.
  Package-specific tools such as `@bufbuild/buf` and the `@types/*` packages
  stay where they are, since they record what that package needs.

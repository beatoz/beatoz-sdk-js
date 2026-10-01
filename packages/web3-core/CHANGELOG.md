# Changelog

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org). See
[RELEASE.md](../../RELEASE.md) for what counts as a major, minor or patch change.

## [Unreleased]

### Changed

- **BREAKING:** `Web3EventEmitter.removeAllListeners()` returns `void`. It had
  no declared return type, so TypeScript inferred one from the body and the
  emitted declaration became `removeAllListeners(): EventEmitter<[never]>` -
  handing callers the private `EventEmitter` this class wraps, and putting a
  Node-only type in the public API. Nothing used the return value.

### Fixed

- The published type declarations now follow ES module rules. `lib/types/` gets
  a `package.json` marking it as ESM, so a consumer's compiler reads the `.d.ts`
  files as ES modules rather than CommonJS. Without it the runtime half of the
  package was ESM while its types were interpreted as CommonJS, which made a
  default import ambiguous.

### Removed

- **BREAKING:** `Web3Subscription`, `Web3SubscriptionManager`,
  `Web3SubscriptionConstructor` and `isSupportSubscriptions` are gone, 394 lines
  that could not run. They are web3.js's `eth_subscribe` machinery, ported
  without `sendSubscriptionRequest()` - the method that assigns a subscription
  its id. `_id` was therefore never set, and `addSubscription()` starts with
  `if (isNullish(sub.id)) throw`, so every call threw. Nothing ever populated
  `registeredSubscriptions` either.

  Subscriptions on this chain go through `web3.beatoz.subscribe()` and its
  siblings, which return an xstream `Stream` over the websocket provider. That
  path is untouched.

### Removed

- No longer depends on `@beatoz/web3-validator`, which it never imported.

### Added

- Adds a `files` field, so the published package carries `lib/`, `src/`,
  `CHANGELOG.md`, `README.md`, `LICENSE` and `package.json`, and nothing else.
  Build leftovers no longer ship: `tsconfig.types.json`, `tsdoc.json` (which
  extended a file that was never published) and the `.tsbuildinfo` incremental
  build caches.

- Ships `src/`. The source maps have always pointed at `../../src/*.ts`, but
  those files were not published, so a debugger could not open the line a stack
  trace named. v2 is still moving quickly, and reading the source is part of
  using it.

- Ships `LICENSE`. Every package declared `Apache-2.0` while publishing no copy
  of the license text.

### Removed

- `.npmignore` is gone, from this package and from the repository root. `files`
  takes precedence over it, so keeping both would leave a file that looks like
  it decides what ships but does not. The root one had been reaching into the
  workspace packages and excluding `src/` from all of them.

### Removed

- **BREAKING:** The CommonJS build is gone. `lib/commonjs` is no longer built
  or published, and the package ships ESM only.

  Node 22.12 and later can `require()` an ES module, and the minimum supported
  Node is now 22.12 for that reason, raised from 22.0. A CommonJS consumer on a
  supported Node keeps working without source changes:

  ```js
  require('@beatoz/web3-core')   // still resolves, via require(esm)
  ```

  The `exports` map uses a `default` condition rather than `import`, so the
  `require` condition matches it too. A bundler or a TypeScript setup pinned to
  an older Node resolution mode may still need updating.

- **BREAKING:** `main` now points at the ESM entry and the `module` field is
  gone; both described the same build before.

### Changed

- **BREAKING:** Adds an `exports` map, so only the package root and its
  `package.json` can be imported. Deep paths such as
  `@beatoz/web3-core/lib/commonjs/index` now fail with
  `ERR_PACKAGE_PATH_NOT_EXPORTED`. Everything under `lib/` used to be
  reachable, which meant the whole build output was public API.

- Adds a `types` field. Type resolution previously relied on `index.d.ts`
  happening to sit next to the file named by `main`.

### Fixed

- Declares `@beatoz/web3-errors` and `xstream`, which it imports but did not
  list. Installing this package on its own could fail at load. `xstream`
  appears only in emitted `.d.ts` files, but a consumer type-checking those
  declarations has to resolve it, so it is a runtime dependency rather than a
  development one.

  This was hidden by the monorepo: every dependency was hoisted to one
  `node_modules`, so these imports resolved here and only here.

### Changed

- **BREAKING:** The minimum supported Node.js version is now 22. It was 16.19,
  which had not been accurate for some time: several dependencies already
  required Node 18 or later.

### Added

- Declares `typescript: ">=5.4"` as an optional peer dependency. No supported
  compiler range was declared before.

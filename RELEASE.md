# Versioning and release policy

`@beatoz/*` packages follow [Semantic Versioning 2.0.0](https://semver.org).
This document defines what counts as a major, minor and patch change here, and
how releases are cut.

Packages depend on each other through caret ranges (`^1.6.5`), so a minor or
patch release reaches consumers without them asking for it. Anyone installing
for the first time, and anyone running `npm update`, gets it.

## Major, minor, patch

A change is **major** when a project depending on us has to change its code, its
build, or its tests. Code that compiles before the upgrade and does not compile
after it is a major change, even when the runtime behaviour is identical.

### Types

| Change | Release |
| --- | --- |
| Widen what a function accepts | minor |
| Narrow what a function accepts | **major** |
| Narrow what a function returns | minor |
| Widen what a function returns | **major** |
| Add an export | minor |
| Remove or rename an export | **major** |

Widening an input and narrowing an output only admit more callers. The opposite
directions reject code that used to compile.

Two cases are easy to misread:

- **Adding an overload to a function that took `any` is major.** Once a function
  has an overload declaration, its implementation signature is no longer
  callable from outside. The `any` line stays in the file, so the diff looks
  harmless, but callers passing `unknown` now fail.

- **Adding a member to a union return type is major.** Callers that switch
  exhaustively on it stop compiling.

### Runtime

| Change | Release |
| --- | --- |
| New function, new optional parameter | minor |
| New required parameter | **major** |
| Different return value for the same input | **major** |
| Normalising `null` to `undefined` at a boundary | **major** |
| Bug fix restoring documented behaviour | patch |

### Environment

| Change | Release |
| --- | --- |
| Raise the minimum Node version | **major** |
| Raise the minimum TypeScript version | **major** |
| Bump a dependency major, where its types appear in our public API | **major** |
| Bump a dependency within its own major | patch |

## Removing

Removals go in a major release. We do not add compatibility layers or fallbacks
for the removed path.

Mark with `@deprecated` before removing when there is a replacement to point at
and consumers who would see the warning. Otherwise remove directly.

An API that never worked is removed without a deprecation. It is still major: it
was exported.

## Experimental APIs

An API prefixed `experimental_` may change or be removed in any release,
including a patch.

An API that stays experimental across two minor releases is either promoted or
removed.

If an experimental API cannot work yet because the chain does not implement what
it needs, it throws an error naming the missing capability. The error states
that the SDK does not support it, not that the call was wrong.

## Package versions

Each package carries its own version. A change to `web3-utils` does not move
`web3-accounts`.

Versions were locked together until v2. Under that scheme every package moved
whenever any package moved, so the number said nothing about whether that
package had changed. The facade and the leaf packages now sit at different
numbers.

## Changelogs

Every package has a `CHANGELOG.md` in
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. The root
`CHANGELOG.md` aggregates them.

Entries are written in the pull request that makes the change, under
`## [Unreleased]`. A change with no entry is not released.

Sections: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
Breaking entries start with `**BREAKING:**` and say what the consumer has to do.

## Cutting a release

1. `yarn build`, `yarn test` and `npx eslint .` pass.
2. Move each `## [Unreleased]` section under the new version and date.
3. Run `lerna version`. It proposes a bump per package from the commit messages;
   override it where this document disagrees. It cannot see whether a type
   widened or narrowed.
4. Publish to the `next` dist-tag. `latest` keeps pointing at the previous
   release.
5. Install from `next` in the projects inside this organization and check them.
6. Move `latest` with `npm dist-tag add`.

Step 5 is not optional for a major release.

## Support

Only the current major gets fixes.

The previous major stays on npm and keeps working: published versions are not
removed, and a caret range does not cross a major, so existing installs are
untouched. We do not backport to it, and we do not promise to.

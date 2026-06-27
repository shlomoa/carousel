# Contributing

This project contains both the demo application and the `@shlomoa/mat-image-carousel` library. Use this guide for branch workflow, local validation, pull requests, and build/release workflows that are intentionally kept out of the main README.

## Working in a Branch

Create all changes on a branch instead of committing directly to `main`.

1. Start from an up-to-date `main` branch:

```bash
git checkout main
git pull --ff-only
```

2. Create a focused branch for the change:

```bash
git checkout -b <type>/<short-description>
```

Examples:

- `feature/thumbnail-selector`
- `fix/release-workflow-permissions`
- `docs/releasing-guide`

3. Keep commits focused and avoid mixing unrelated changes.
4. Rebase or merge from `main` before opening a pull request if the branch has drifted.
5. Before pushing, review your local diff:

```bash
git status
git diff
```

## Local Build and Validation

Install dependencies from the lockfile before validating changes:

```bash
npm ci
```

Run the checks that match the changed area:

```bash
npm run lint
npm test
npm run build
npm run build:lib
```

Recommended validation stages:

1. **During development:** use `npm start` for the demo app or `npm run watch` for a development build loop.
2. **Before committing:** run `npm run lint` and the most relevant tests.
3. **Before creating a PR:** run the full validation set above.
4. **For library changes:** always include `npm run build:lib` because it validates packaging/typings through `ng-packagr`.
5. **For visual UI changes:** run the demo app and update screenshots or documentation when behaviour or layout changes.

The repository CI workflow in `.github/workflows/build.yml` runs on pushes and pull requests targeting `main`. It installs dependencies with `npm ci`, then runs:

```bash
npm run build
npm run lint
```

Run tests locally as well, because the current CI build workflow does not execute `npm test`.

## Creating a Pull Request (PR)

When the branch is ready:

1. Push the branch:

```bash
git push --set-upstream origin <branch-name>
```

2. Open a pull request into `main`.
3. Include a concise summary of the change.
4. List validation performed, for example:
   - `npm run lint`
   - `npm test`
   - `npm run build`
   - `npm run build:lib`
5. Add screenshots or notes for visible UI changes.
6. Link related issues, workflow failures, or release tasks when relevant.
7. Wait for GitHub Actions to pass and address review feedback on the same branch.

Prefer small PRs with one clear purpose. If a change touches both code and release documentation, call that out in the PR description so reviewers can validate both paths.

## Build the Demo for Production

Generate an optimised production bundle under `dist/photo-carousel-demo/`:

```bash
npm run build
```

## Library Build and Release

The carousel components ship as a standalone library under `projects/mat-image-carousel`.

Build, pack, or publish the library from the workspace root:

- `npm run build:lib` builds the library with `ng build mat-image-carousel`.
- `npm run pack:lib` builds the library and produces a `.tgz` package via `npm pack`.
- `npm run publish:lib` builds the library and publishes it to npm. This requires an authenticated npm session.

`npm run pack:lib` emits `dist/mat-image-carousel/shlomoa-mat-image-carousel-<version>.tgz`, which can be installed locally with:

```bash
npm install ./shlomoa-mat-image-carousel-<version>.tgz
```

For full component usage and API documentation, see [`projects/mat-image-carousel/README.md`](./projects/mat-image-carousel/README.md).

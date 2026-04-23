# Contributing

This project contains both the demo application and the `@shlomoa/mat-image-carousel` library. Use this guide for build and release workflows that are intentionally kept out of the main README.

## Build the Demo for Production

Generate an optimised production bundle under `dist/mat-image-carousel/`:

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

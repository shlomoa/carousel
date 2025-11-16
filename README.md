# Photo Carousel Demo

An Angular 20+ demo that showcases an infinite photo carousel with keyboard, pointer, and thumbnail navigation. The implementation emphasises signal-based state management, accessibility, and component reusability. Architectural details live in [`docs/CAROUSEL_SPEC.md`](./docs/CAROUSEL_SPEC.md).

See a simple caroucel proof of concept in [this stackblitz project](https://stackblitz.com/edit/stackblitz-starters-wqy2bpwo?file=src%2Fmain.ts).

![Screenshot showing the carousel UI](docs/screenshot.png)

## What to Expect

- Seamless looping carousel powered by array rotation (no DOM cloning).
- Native touch mouse and keyboard support.
- Smaller preview carousel view.
- Informative selection metadata panel announcing.
- Responsive layout tuned for desktop, tablets, and phones—portrait or landscape—with automatic height clamping so the hero image always stays in frame.

## Prerequisites

- [Angular Material 20.2.12](https://material.angular.io/).
- npm 11 and node v24.

Install dependencies once:

```
npm install
```

## How to Run the Demo Locally

Start the development server (serves on `http://localhost:4200/` by default):

```
npm start
```

The carousel reloads automatically when source files change. Use `--host`/`--port` flags if you need to expose the server to other devices (e.g., `npm start -- --host 0.0.0.0 --port 8080`).

## How to Build for Production

Generate an optimised production bundle under `dist/photo-carousel-demo/`:

```
npm run build
```

## How to Run Tests

Execute the Karma/Jasmine unit tests in headless Chrome:

```
npm test
```

Watch mode is available with `npm test -- --watch=true`.

## Interaction Cheat Sheet

- Use the on-screen chevron buttons to move backward or forward one slide.
- **Swipe horizontally** across the main image (touch or pointer drag) to advance the carousel—swipe left for next, swipe right for previous.
- Long-press on touch devices to select the currently focused slide without navigating.
- Press `←` / `→` for navigation and `Enter` or `Space` to select when the carousel has focus.
- Tap thumbnails in the selector rail to jump directly to any visible preview.

## Component Usage Scenarios

### `image-carousel`
- **Gallery shell:** Supply an array of `CarouselImage` objects to render a full carousel with built-in track navigation, swipe handling, and selection output.
- **Accessible hero banner:** Provide an `ariaLabel` to expose carousel context to assistive tech while leveraging keyboard support out of the box.

### `carousel-selector`
- **Thumbnail navigator:** Pair with `image-carousel` to display current/adjacent thumbnails and allow jump navigation through the `navigateTo` output.
- **Compact preview rail:** Render standalone beneath other media components by feeding in a subset of images and wiring navigation callbacks manually.

### `selection-details`
- **Metadata panel:** Bind to a selected `CarouselImage` to announce captions, alt text, and resolution where available.
- **Live announcement card:** Use its `aria-live="polite"` behaviour to provide nonvisual confirmation when selections change.

### `uplevel`
- **Navigation affordance:** Surface a stylised Material button that emits an `activated` event when clicked—perfect for "back to gallery" or breadcrumb interactions.
- **Decorative CTA:** Drop into marketing layouts where a compact, on-brand upward arrow control is desired.

For deeper architectural notes—including signal wiring, animation timing, and accessibility considerations—see [`docs/CAROUSEL_SPEC.md`](./docs/CAROUSEL_SPEC.md).

## Library Distribution

The carousel components now ship as a standalone library under `projects/mat-image-carousel`.

- Install from npm:
	```
	npm install @shlomoa/mat-image-carousel
	```
- Import the standalone components directly into your Angular feature modules or components:
	```ts
	import { ImageCarouselComponent, SelectionDetailsComponent } from '@shlomoa/mat-image-carousel';
	```
- Build / pack / publish from the workspace root:
	- `npm run build:lib` – run `ng build mat-image-carousel`
	- `npm run pack:lib` – build and produce a `.tgz` via `npm pack`
	- `npm run publish:lib` – build and publish to npm (requires login)

`npm run pack:lib` emits `dist/mat-image-carousel/shlomoa-mat-image-carousel-<version>.tgz`, which you can install with `npm install ./shlomoa-mat-image-carousel-<version>.tgz` in another project.

See [`projects/mat-image-carousel/README.md`](./projects/mat-image-carousel/README.md) for full usage details and API docs.

## License

This project is licensed under the MIT License. See the [`LICENSE`](./LICENSE) file for details.

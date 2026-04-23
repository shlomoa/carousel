# @shlomoa/mat-image-carousel

`@shlomoa/mat-image-carousel` is a standalone Angular component library that delivers a polished, Material-inspired photo carousel with keyboard support, swipe gestures, thumbnail navigation, and optional selection metadata.

The library powers the demo app in this repository and can be installed independently in any Angular >= 17 project.

## Installation

```bash
npm install @shlomoa/mat-image-carousel
```

Make sure your project already depends on `@angular/material` (v20 or newer).

## Usage

Import the components you need directly into your standalone component:

```typescript
import { Component } from '@angular/core';
import { ImageCarouselComponent, SelectionDetailsComponent, CarouselImage } from '@shlomoa/mat-image-carousel';

@Component({
   selector: 'demo-shell',
   imports: [ImageCarouselComponent, SelectionDetailsComponent],
   template: `
      <image-carousel
         [images]="images"
         ariaLabel="Sample trip photos"
         (selectionChange)="selection = $event"
      />

      <selection-details
         [image]="selection?.image ?? null"
         [index]="selection?.index ?? null"
      />
   `,
})
export class DemoShellComponent {
   images: CarouselImage[] = [
      { src: 'https://picsum.photos/id/1015/1200/800', alt: 'Mountain lake' },
      { src: 'https://picsum.photos/id/1025/1200/800', alt: 'Puppy portrait' },
      // ...
   ];

   selection: { index: number; image: CarouselImage } | null = null;
}
```

### Optional exports

- `ImageCarouselComponent`: the main carousel with swipe gestures and navigation controls.
- `CarouselSelectorComponent`: thumbnail rail with wrap-around navigation.
- `SelectionDetailsComponent`: accessible announcement panel for the current selection.
- `UplevelComponent`: decorative Material button that emits an `activated` event.
- `CarouselImage`, `CarouselSelection`: shared TypeScript interfaces.

Repository build and release workflows are documented in [`CONTRIBUTING.md`](../../CONTRIBUTING.md).

## License

Licensed under the [MIT License](../../LICENSE).

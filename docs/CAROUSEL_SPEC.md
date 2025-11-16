# Photo Carousel Implementation Specification

This document describes the Angular implementation provided by the `@shlomoa/mat-image-carousel` library (`projects/mat-image-carousel/src/lib`). It covers component responsibilities, state management, navigation mechanics, user interactions, accessibility, and visual behaviour. The demo application under `src/app/components` consumes the same exported components.

## 1. Component Overview

### 1.1 `ImageCarouselComponent` (`image-carousel`)
- **Purpose:** Hosts the main viewport, navigation controls, and thumbnail selector row. Emits selection changes to the shell.
- **Inputs:**
    - `images` (required): immutable `CarouselImage[]` provided by the host.
    - `ariaLabel` (optional): overrides the default "Photo carousel" label for assistive tech.
- **Output:** `selectionChange` emits `{ index, image }` whenever a slide is explicitly selected.
- **DOM structure:**
    - `section.carousel` acts as an interactive region (`tabindex="0"`).
    - `div.viewport` wraps a flex-based `div.track` that holds a rotating list of `article.slide` elements.
    - Prev/next Material icon buttons flank the viewport.
    - A `div.selector-row` renders `<uplevel>` and `<carousel-selector>` underneath the viewport.
- **Image rendering:** Uses `NgOptimizedImage` (`[ngSrc]`) with responsive object-fit and optional captions.

### 1.2 `CarouselSelectorComponent` (`carousel-selector`)
- **Purpose:** Provides three thumbnail buttons (current, previous, next) plus explicit previous/next controls for quick navigation.
- **Inputs:**
    - `images`, `visibleIndexes`, `currentIndex`, `selectedIndex`, `selectionPulse` (for highlighting recent selections).
- **Output:** `navigateTo` emits the absolute item index to navigate to.
- **Behaviour:**
    - Emits navigation events when any thumbnail or chevron button is clicked.
    - Highlights the active thumbnail and previously selected thumbnail separately.
    - Falls back to the full image source if `thumbnailSrc` is missing.

### 1.3 `SelectionDetailsComponent` (`selection-details`)
- **Purpose:** Displays metadata about the currently selected photo beneath the carousel.
- **Inputs:**
    - `image`: the currently selected `CarouselImage` (or `null`).
    - `index`: zero-based selected index (or `null`).
    - `caption`: optional override (currently unused by the shell).
- **Rendered details:** slide number, caption fallback chain (`caption → image.caption → image.alt → "Photo N"`), alt text, and resolution when available. The container is announced via `aria-live="polite"`.

### 1.4 `UplevelComponent` (`uplevel`)
- **Purpose:** Displays a decorative "navigate up" control with Material styling.
- **Output:** `activated` emits on click; the current shell does not handle this event yet, so the control is visually present but functionally inert.

### 1.5 `AppComponent` (`app-root`)
- Imports `ImageCarouselComponent` and `SelectionDetailsComponent` directly from the `@shlomoa/mat-image-carousel` package.
- Holds the image data array and current selection as Angular signals.
- Passes `images` into `<image-carousel>` and listens for `selectionChange` to update local state.
- Passes the resulting `selectedImage` and `selectedIndex` into `<selection-details>`.

## 2. State Model and Signals

The carousel relies on Angular signals for deterministic updates:

- **`images` (input):** Immutable array supplied by the host.
- **`slides`:** Signal containing the currently rendered slide order. It is derived via `createSlides` and `alignSlides` to support infinite looping.
- **`currentIndex`:** Index into `slides` representing the visible slot in the track.
- **`currentItemIndex`:** Derived from `currentIndex`, mapping through to the `items` array.
- **`selectedIndex`:** Tracks the user's explicitly chosen photo (via click, pointer, or keyboard).
- **`visibleThumbnailIndexes`:** Returns `[prev, current, next]` when more than three items exist; otherwise returns every index. Used to limit the selector footprint.
- **`selectionPulse`:** Incremented on selection to trigger CSS pulse animations for both the slide and matching thumbnail.
- **`activeDescendantId`:** Exposes the active slide ID for assistive tech when the carousel has focus.

Effects (`effect(...)`) keep these signals in sync, clamp out-of-range indices, reset state when inputs change, and emit `selectionChange` events.

## 3. Infinite Loop Mechanics

The implementation uses an **array rotation** technique to emulate an endless track:

1. **Initial Alignment:**
    - `createSlides` pre-rotates the slides so that index `1` corresponds to the first logical item, enabling backward wraps without cloning nodes.
    - `alignSlides` reorders slides based on the previously settled item (if any) to avoid jumps when the image array changes size.
2. **Navigation Queue:**
    - `enqueueNavigation` ensures only one animation runs at a time. Additional navigation requests are queued and executed sequentially once the current animation settles.
3. **Wrap Handling:**
    - When advancing beyond either edge, `applyWrap` temporarily disables transitions, rotates the slides array (front-to-back or back-to-front), snaps the `currentIndex`, forces a reflow, and then re-enables transitions for the visible animation.
4. **Deferred Animation:**
    - `startAnimation` uses `setTimeout` to move to the target index on the next event loop tick, ensuring the browser commits the invisible state change before animating. This avoids jitter and race conditions.

## 4. Interaction Model

- **Navigation Buttons:**
    - `mat-icon-button` controls on the left/right of the viewport call `prev()` and `next()`.
    - The thumbnail selector provides secondary prev/next controls that wrap around the item array.
- **Thumbnail Click:** Selecting a thumbnail emits `navigateTo` and routes through `goToItem`, which chooses the shortest path (clockwise or counter-clockwise) to the requested item.
- **Pointer Gestures:**
    - Horizontal swipe detection uses a threshold of the greater of `48px` or `8%` of the viewport width.
    - Touch long-press (≥450 ms with minimal movement) selects the current slide without navigating.
    - Mouse and pen clicks on a slide also select the photo if the pointer did not travel past the move tolerance.
- **Keyboard Support:**
    - `ArrowRight` / `ArrowLeft` navigate slides while the carousel host has focus.
    - `Enter` or `Space` selects the currently visible item.
- **Selection Feedback:**
    - Selecting an item sets `selectedIndex`, emits `selectionChange`, and increments `selectionPulse`, which triggers a brief CSS glow on both the slide and its thumbnail.

## 5. Selection Details Workflow

`AppComponent` stores the received `selectionChange` events, exposing `selectedImage` and `selectedIndex` signals. These values feed the `selection-details` component, which:

- Renders only when a selection exists (`hasSelection`).
- Announces updates via `aria-live="polite"` for assistive technologies.
- Uses computed fallbacks for captions and slide numbering (`slideLabel = index + 1` or em-dash when unknown).
- Shows alt text and image dimensions when present in the source data.

## 6. Accessibility Considerations

- The carousel root is keyboard focusable and exposes a customizable `aria-label`.
- The slide list functions as a `role="listbox"` with each slide as `role="option"` and `aria-selected` state.
- `activeDescendantId` keeps assistive tech informed about the focused slide while the listbox has focus.
- Buttons include descriptive `aria-label`s, and the selection details panel uses polite live regions to narrate updates.
- The `uplevel` button contains a visually hidden text label to complement its iconography.

## 7. Styling and Layout

- Carousel maintains a `16:9` aspect ratio on desktop and `4:3` on narrow viewports (<600 px).
- Slides fill the viewport, with captions overlaid using a translucent backdrop.
- Navigation buttons float over the viewport with blurred glass backgrounds and hover/focus states.
- The selector row centers its content, spacing the uplevel control from the thumbnail list.
- Selection pulses use keyframed scale and box-shadow transitions for emphasis.
- In short landscape scenarios (e.g., handsets rotated horizontally) the viewport height is clamped and slide images switch to `object-fit: contain`, keeping the full frame visible without cropping.
- Thumbnail buttons and the uplevel control scale down at shared breakpoint tiers (600 px, 480 px) so the selector row remains a single aligned line across phones and tablets.

## 8. Integration Notes

- The demo seeds five sample images from Picsum with captions, alt text, and dimensions.
- No global state store is required; all component state is local via signals.
- The `uplevel` component currently emits an `activated` event with no listener—future features may hook into it for navigation.
- The carousel ships as the `@shlomoa/mat-image-carousel` Angular library and is built with `ng build mat-image-carousel`; `npm run pack:lib` produces a distributable tarball.
- Unit tests (`npm test`) validate component creation, carousel rendering, and uplevel presence across both the library and demo shell.

This specification reflects the behaviour of the codebase as of November 2025.

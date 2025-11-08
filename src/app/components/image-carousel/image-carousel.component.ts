import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarouselSelectorComponent } from './carousel-selector.component';
import { UplevelComponent } from '../uplevel/uplevel.component';

export interface CarouselImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  thumbnailSrc?: string;
  description?: string;
}

export interface CarouselSelection {
  index: number;
  image: CarouselImage;
}

export interface CarouselSlide {
  readonly id: string;
  readonly image: CarouselImage;
  readonly itemIndex: number;
}

@Component({
  selector: 'image-carousel',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    NgOptimizedImage,
    CarouselSelectorComponent,
    UplevelComponent,
  ],
  templateUrl: './image-carousel.component.html',
  styleUrls: ['./image-carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'onKeydown($event)',
  },
})
export class ImageCarouselComponent implements OnDestroy {
  readonly images = input.required<CarouselImage[]>();
  readonly ariaLabel = input<string | undefined>();
  readonly selectionChange = output<CarouselSelection>();
  readonly slides = signal<CarouselSlide[]>([]);
  readonly isTransitionEnabled = signal(true);
  readonly trackTransform = computed(() => `translateX(${-this.currentIndex() * 100}%)`);
  private readonly currentSlide = computed(() => {
    const slides = this.slides();
    const index = this.currentIndex();
    return index >= 0 && index < slides.length ? slides[index] : null;
  });
  readonly currentItemIndex = computed<number | null>(() => {
    const slide = this.currentSlide();
    return slide ? slide.itemIndex : null;
  });
  readonly activeDescendantId = computed<string | null>(() => this.currentSlide()?.id ?? null);

  @ViewChild('track', { static: true }) private trackRef!: ElementRef<HTMLElement>;

  currentIndex = signal(0);
  private readonly slideCount = computed(() => this.slides().length);
  readonly selectedIndex = signal<number | null>(null);
  readonly selectionPulse = signal(0);
  readonly visibleThumbnailIndexes = computed(() => {
    const items = this.images();
    const count = items.length;
    if (count === 0) {
      return [];
    }
    if (count <= 3) {
      return items.map((_, index) => index);
    }

    const current = this.currentItemIndex();
    if (current === null) {
      return [0, 1, 2];
    }

    const prev = (current - 1 + count) % count;
    const next = (current + 1) % count;
    return [prev, current, next];
  });
  private readonly selectedSelection = computed(() => {
    const index = this.selectedIndex();
    const items = this.images();
    if (index === null || !items.length || index < 0 || index >= items.length) {
      return null;
    }
    return { index, image: items[index] } satisfies CarouselSelection;
  });

  private pointerActive = false;
  private pointerStartX = 0;
  private pointerInitialIndex: number | null = null;
  private pointerDownTime = 0;
  private pointerTriggeredNavigation = false;
  private readonly longPressMs = 450;
  private readonly longPressMoveTolerance = 12;
  private animationTimer: number | null = null;
  private navigationQueue: Array<() => void> = [];
  private isAnimating = false;
  private lastSettledItemIndex: number | null = null;

  constructor() {
    effect(() => {
      const items = this.images();
      const slides = this.createSlides(items);
      this.resetNavigationState();
      const { alignedSlides, index } = this.alignSlides(slides, items.length);
      this.isTransitionEnabled.set(false);
      this.slides.set(alignedSlides);
      this.currentIndex.set(index);
      this.forceReflow();
      this.isTransitionEnabled.set(true);
    });

    effect(() => {
      const n = this.slideCount();
      const index = this.currentIndex();
      if (n === 0) {
        if (index !== 0) {
          this.currentIndex.set(0);
        }
        return;
      }
      const clampedIndex = Math.max(0, Math.min(index, n - 1));
      if (clampedIndex !== index) {
        this.currentIndex.set(clampedIndex);
      }
    });

    effect(() => {
      const selection = this.selectedSelection();
      if (!selection) return;
      this.selectionChange.emit(selection);
    });

    effect(() => {
      const items = this.images();
      const selected = this.selectedIndex();
      if (!items.length && selected !== null) {
        this.selectedIndex.set(null);
        return;
      }
      if (selected !== null && (selected < 0 || selected >= items.length)) {
        this.selectedIndex.set(null);
      }
    });

    effect(() => {
      this.lastSettledItemIndex = this.currentItemIndex();
    });
  }

  next(): void {
    this.enqueueNavigation(1);
  }

  prev(): void {
    this.enqueueNavigation(-1);
  }

  goTo(index: number): void {
    const slidesLength = this.slideCount();
    if (slidesLength === 0) return;
    if (index < 0 || index >= slidesLength) return;

    const current = this.currentIndex();
    if (index === current) {
      return;
    }

    const forwardSteps = (index - current + slidesLength) % slidesLength;
    const backwardSteps = (current - index + slidesLength) % slidesLength;

    if (forwardSteps === 0) {
      return;
    }

    if (forwardSteps <= backwardSteps) {
      this.queueNavigationSteps(1, forwardSteps);
    } else {
      this.queueNavigationSteps(-1, backwardSteps);
    }
  }

  goToItem(itemIndex: number): void {
    const items = this.images();
    const total = items.length;
    if (total === 0) return;
    if (itemIndex < 0 || itemIndex >= total) return;

    const currentItem = this.currentItemIndex();
    if (currentItem === null) {
      return;
    }

    const forwardSteps = (itemIndex - currentItem + total) % total;
    const backwardSteps = (currentItem - itemIndex + total) % total;

    if (forwardSteps === 0) {
      return;
    }

    if (forwardSteps <= backwardSteps) {
      this.queueNavigationSteps(1, forwardSteps);
    } else {
      this.queueNavigationSteps(-1, backwardSteps);
    }
  }

  onPointerDown(evt: PointerEvent) {
    const el = this.trackRef.nativeElement;
    this.pointerActive = true;
    this.pointerStartX = evt.clientX;
    this.pointerTriggeredNavigation = false;
    this.pointerDownTime = this.now();
    this.pointerInitialIndex = this.currentIndex();
    el.setPointerCapture?.(evt.pointerId);
  }

  onPointerUp(evt: PointerEvent) {
    if (!this.pointerActive) return;
    const dx = evt.clientX - this.pointerStartX;
    const threshold = Math.max(48, this.trackRef.nativeElement.clientWidth * 0.08);
    this.pointerActive = false;

    if (dx <= -threshold) {
      this.next();
      this.pointerTriggeredNavigation = true;
    } else if (dx >= threshold) {
      this.prev();
      this.pointerTriggeredNavigation = true;
    }

    this.maybeSelectFromPointer(evt, dx);
    this.resetPointerGestureState();
  }

  onPointerCancel() {
    if (!this.pointerActive) return;
    this.pointerActive = false;
    this.resetPointerGestureState();
  }

  onImageLoad(_i: number) {
    // hook for future: skeletons, height sync, etc.
  }

  onKeydown(ev: KeyboardEvent) {
    if (ev.key === 'ArrowRight') { ev.preventDefault(); this.next(); }
    else if (ev.key === 'ArrowLeft') { ev.preventDefault(); this.prev(); }
    else if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      const itemIndex = this.currentItemIndex();
      if (itemIndex !== null) {
        this.selectItem(itemIndex);
      }
    }
  }

  isSelected(index: number): boolean {
    const selected = this.selectedIndex();
    return selected !== null && selected === index;
  }

  isCurrentItem(itemIndex: number): boolean {
    const current = this.currentItemIndex();
    return current !== null && current === itemIndex;
  }

  private selectItem(itemIndex: number) {
    const items = this.images();
    if (itemIndex < 0 || itemIndex >= items.length) return;
    this.selectedIndex.set(itemIndex);
    this.selectionPulse.update((token) => token + 1);
  }

  private maybeSelectFromPointer(evt: PointerEvent, dx: number) {
    if (this.pointerTriggeredNavigation) {
      return;
    }

    const pointerType = evt.pointerType;
    const elapsed = this.now() - this.pointerDownTime;
    const movedFar = Math.abs(dx) > this.longPressMoveTolerance;
    const targetSlideIndex = this.pointerInitialIndex ?? this.currentIndex();
    const itemIndex = this.itemIndexFromSlideIndex(targetSlideIndex);

    if (itemIndex === null) {
      return;
    }

    if (pointerType === 'touch') {
      if (!movedFar && elapsed >= this.longPressMs) {
        evt.preventDefault();
        this.selectItem(itemIndex);
      }
      return;
    }

    if (pointerType === 'mouse' || pointerType === 'pen') {
      if (!movedFar) {
        this.selectItem(itemIndex);
      }
    }
  }

  private resetPointerGestureState() {
    this.pointerInitialIndex = null;
    this.pointerDownTime = 0;
    this.pointerTriggeredNavigation = false;
  }

  private createSlides(items: readonly CarouselImage[]): CarouselSlide[] {
    const slides = items.map((image, index) => ({
      id: `slide-${index}`,
      image,
      itemIndex: index,
    }));

    if (slides.length > 1) {
      const last = slides[slides.length - 1];
      return [last, ...slides.slice(0, slides.length - 1)];
    }

    return slides;
  }

  private alignSlides(slides: CarouselSlide[], itemCount: number): {
    alignedSlides: CarouselSlide[];
    index: number;
  } {
    if (itemCount === 0 || slides.length === 0) {
      return { alignedSlides: [], index: 0 };
    }

    const anchorIndex = slides.length > 1 ? 1 : 0;
    const fallbackIndex = Math.min(anchorIndex, Math.max(0, slides.length - 1));
    const desiredItemIndex = this.lastSettledItemIndex !== null
      ? Math.min(this.lastSettledItemIndex, itemCount - 1)
      : 0;

    const desiredSlideIndex = slides.findIndex((slide) => slide.itemIndex === desiredItemIndex);
    if (desiredSlideIndex === -1) {
      return { alignedSlides: slides, index: fallbackIndex };
    }

    const rotation = this.normalizeIndex(desiredSlideIndex - anchorIndex, slides.length);
    const alignedSlides = rotation === 0
      ? slides
      : [...slides.slice(rotation), ...slides.slice(0, rotation)];

    return { alignedSlides, index: fallbackIndex };
  }

  private itemIndexFromSlideIndex(index: number): number | null {
    if (index < 0) {
      return null;
    }
    const slide = this.slides()[index];
    return slide ? slide.itemIndex : null;
  }

  private now(): number {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  }

  private enqueueNavigation(direction: 1 | -1): void {
    if (this.slideCount() <= 1) {
      return;
    }
    const task = () => this.navigateOnce(direction);
    if (this.isAnimating) {
      this.navigationQueue.push(task);
      return;
    }
    task();
  }

  private queueNavigationSteps(direction: 1 | -1, steps: number): void {
    if (steps <= 0) return;
    for (let i = 0; i < steps; i += 1) {
      this.enqueueNavigation(direction);
    }
  }

  private navigateOnce(direction: 1 | -1): void {
    const slides = this.slides();
    const total = slides.length;
    if (total <= 1) {
      return;
    }

    const current = this.currentIndex();
    const needsForwardWrap = direction === 1 && current === total - 1;
    const needsBackwardWrap = direction === -1 && current === 0;

    if (needsForwardWrap || needsBackwardWrap) {
      this.applyWrap(direction);
    }

    const normalizedTarget = this.normalizeIndex(this.currentIndex() + direction, this.slides().length);
    this.startAnimation(normalizedTarget);
  }

  private applyWrap(direction: 1 | -1): void {
    const slides = this.slides();
    const total = slides.length;
    if (total <= 1) return;

    const currentIndex = this.currentIndex();
    this.isTransitionEnabled.set(false);

    if (direction === 1) {
      const [first, ...rest] = slides;
      const rotated = [...rest, first];
      this.slides.set(rotated);
      const snappedIndex = this.normalizeIndex(currentIndex - 1, rotated.length);
      this.currentIndex.set(snappedIndex);
    } else {
      const last = slides[total - 1];
      const rotated = [last, ...slides.slice(0, total - 1)];
      this.slides.set(rotated);
      const snappedIndex = this.normalizeIndex(currentIndex + 1, rotated.length);
      this.currentIndex.set(snappedIndex);
    }

    this.forceReflow();
  }

  private startAnimation(targetIndex: number): void {
    this.cancelAnimationTimer();
    this.isAnimating = true;
    const timer = globalThis.setTimeout(() => {
      this.isTransitionEnabled.set(true);
      this.currentIndex.set(targetIndex);
      this.animationTimer = null;
      this.isAnimating = false;
      this.processNavigationQueue();
    }, 0);
    this.animationTimer = typeof timer === 'number' ? timer : null;
  }

  private processNavigationQueue(): void {
    if (this.navigationQueue.length === 0) {
      return;
    }
    const nextTask = this.navigationQueue.shift();
    if (nextTask) {
      nextTask();
    }
  }

  private resetNavigationState(): void {
    this.cancelAnimationTimer();
    this.navigationQueue = [];
    this.isAnimating = false;
  }

  private cancelAnimationTimer(): void {
    if (this.animationTimer !== null) {
      globalThis.clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
  }

  private forceReflow(): void {
    if (!this.trackRef) {
      return;
    }
    void this.trackRef.nativeElement.offsetHeight;
  }

  private normalizeIndex(value: number, length: number): number {
    if (length === 0) return 0;
    const mod = value % length;
    return mod < 0 ? mod + length : mod;
  }

  ngOnDestroy(): void {
    this.resetNavigationState();
  }
}

import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  signal,
  computed,
  effect,
  OnDestroy,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface CarouselImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
}

@Component({
  selector: 'photo-carousel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, NgOptimizedImage],
  templateUrl: './photo-carousel.component.html',
  styleUrls: ['./photo-carousel.component.scss']
})
export class PhotoCarouselComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) images: CarouselImage[] = [];
  @Input() loop = true;
  @Input() ariaLabel?: string;
  /** Autoplay in ms. Set 0/undefined to disable. */
  @Input() autoplayMs?: number;

  @ViewChild('track', { static: true }) private trackRef!: ElementRef<HTMLElement>;

  currentIndex = signal(0);
  private slideCount = computed(() => this.images.length);
  private autoplayId: any = null;

  private pointerActive = false;
  private pointerStartX = 0;
  private pointerStartScroll = 0;

  constructor() {
    effect(() => {
      const n = this.slideCount();
      if (n === 0) return;
      if (this.currentIndex() > n - 1) {
        this.currentIndex.set(n - 1);
        queueMicrotask(() => this.snapTo(this.currentIndex()));
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.autoplayMs && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  next(): void {
    const n = this.slideCount();
    if (n === 0) return;
    const i = this.currentIndex();
    const next = i + 1 >= n ? (this.loop ? 0 : i) : i + 1;
    this.goTo(next);
  }

  prev(): void {
    const n = this.slideCount();
    if (n === 0) return;
    const i = this.currentIndex();
    const prev = i - 1 < 0 ? (this.loop ? n - 1 : i) : i - 1;
    this.goTo(prev);
  }

  goTo(index: number): void {
    if (index < 0 || index >= this.slideCount()) return;
    this.currentIndex.set(index);
    this.snapTo(index);
    this.bumpAutoplay();
  }

  canNext(): boolean {
    return this.loop || this.currentIndex() < this.slideCount() - 1;
  }
  canPrev(): boolean {
    return this.loop || this.currentIndex() > 0;
  }

  private snapTo(index: number): void {
    const el = this.trackRef.nativeElement;
    const x = index * el.clientWidth;
    el.scrollTo({ left: x, behavior: 'smooth' });
  }

  onScroll(): void {
    const el = this.trackRef.nativeElement;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== this.currentIndex()) this.currentIndex.set(idx);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    if (ev.key === 'ArrowRight') { ev.preventDefault(); this.next(); }
    else if (ev.key === 'ArrowLeft') { ev.preventDefault(); this.prev(); }
  }

  onPointerDown(evt: PointerEvent) {
    const el = this.trackRef.nativeElement;
    this.pointerActive = true;
    this.pointerStartX = evt.clientX;
    this.pointerStartScroll = el.scrollLeft;
    el.setPointerCapture?.(evt.pointerId);
    this.stopAutoplay();
  }

  onPointerUp(evt: PointerEvent) {
    if (!this.pointerActive) return;
    const dx = evt.clientX - this.pointerStartX;
    const threshold = Math.max(48, this.trackRef.nativeElement.clientWidth * 0.08);
    this.pointerActive = false;

    if (dx <= -threshold) this.next();
    else if (dx >= threshold) this.prev();
    else this.snapTo(this.currentIndex());

    this.bumpAutoplay();
  }

  onPointerCancel() {
    if (!this.pointerActive) return;
    this.pointerActive = false;
    this.snapTo(this.currentIndex());
    this.bumpAutoplay();
  }

  onImageLoad(_i: number) {
    // hook for future: skeletons, height sync, etc.
  }

  private startAutoplay() {
    if (!this.autoplayMs) return;
    this.stopAutoplay();
    this.autoplayId = setInterval(() => this.next(), this.autoplayMs);
  }
  private stopAutoplay() {
    if (this.autoplayId) {
      clearInterval(this.autoplayId);
      this.autoplayId = null;
    }
  }
  private bumpAutoplay() {
    if (this.autoplayMs && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.startAutoplay();
    }
  }
}

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CarouselImage } from '../types';

@Component({
  selector: 'carousel-selector',
  imports: [MatButtonModule, MatIconModule, NgOptimizedImage],
  templateUrl: './carousel-selector.component.html',
  styleUrls: ['./carousel-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselSelectorComponent {
  readonly images = input.required<CarouselImage[]>();
  readonly visibleIndexes = input.required<readonly number[]>();
  readonly currentIndex = input.required<number>();
  readonly selectedIndex = input<number | null>(null);
  readonly selectionPulse = input(0);

  readonly navigateTo = output<number>();

  protected goPrevious(): void {
    const images = this.images();
    if (!images.length) {
      return;
    }
    const target = this.normalizeIndex(this.currentIndex() - 1, images.length);
    if (target !== null) {
      this.emitNavigation(target);
    }
  }

  protected goNext(): void {
    const images = this.images();
    if (!images.length) {
      return;
    }
    const target = this.normalizeIndex(this.currentIndex() + 1, images.length);
    if (target !== null) {
      this.emitNavigation(target);
    }
  }

  protected isCurrent(index: number): boolean {
    const current = this.currentIndex();
    return current >= 0 && current === index;
  }

  protected isSelected(index: number): boolean {
    const selected = this.selectedIndex();
    return selected !== null && selected === index;
  }

  protected onNavigate(index: number): void {
    const total = this.images().length;
    const target = this.normalizeIndex(index, total);
    if (target === null) {
      return;
    }
    this.emitNavigation(target);
  }

  protected thumbnailSrc(index: number): string {
    const image = this.images()[index];
    if (!image) {
      return '';
    }
    return image.thumbnailSrc ?? image.src;
  }

  protected imageLabel(index: number): string {
    const image = this.images()[index];
    if (!image) {
      return `Photo ${index + 1}`;
    }
    return image.caption ?? image.alt ?? `Photo ${index + 1}`;
  }

  private emitNavigation(target: number): void {
    if (target === this.currentIndex()) {
      return;
    }
    this.navigateTo.emit(target);
  }

  private normalizeIndex(index: number, length: number): number | null {
    if (length <= 0 || Number.isNaN(index)) {
      return null;
    }
    const mod = index % length;
    return mod < 0 ? mod + length : mod;
  }
}
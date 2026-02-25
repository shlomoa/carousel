import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { CarouselImage } from '../types';

@Component({
  selector: 'selection-details',
  imports: [],
  templateUrl: './selection-details.component.html',
  styleUrls: ['./selection-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionDetailsComponent {
  readonly image = input<CarouselImage | null>(null);
  readonly index = input<number | null>(null);
  readonly caption = input<string | null>(null);

  protected readonly hasSelection = computed(() => this.image() !== null);
  protected readonly slideLabel = computed(() => {
    const index = this.index();
    if (index === null) {
      return '—';
    }
    return index + 1;
  });

  protected readonly resolvedCaption = computed(() => {
    const caption = this.caption();
    if (caption) {
      return caption;
    }
    const image = this.image();
    const slide = this.index();
    if (!image) {
      return null;
    }
    if (image.caption) {
      return image.caption;
    }
    if (image.alt) {
      return image.alt;
    }
    return slide === null ? null : `Photo ${slide + 1}`;
  });
}
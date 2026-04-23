import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  ImageCarouselComponent,
  SelectionDetailsComponent,
  CarouselImage,
  CarouselSelection,
} from '@shlomoa/mat-image-carousel';

type DemoImageSeed = Readonly<{
  id: number;
  alt: string;
  caption: string;
}>;

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ImageCarouselComponent,
    SelectionDetailsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly collectionSizeOptions = [2, 3, 4, 8, 16] as const;
  readonly imageSizeOptions = [300, 500, 800, 1000] as const;

  private readonly demoImages: readonly DemoImageSeed[] = [
    { id: 1015, alt: 'Mountain lake', caption: 'Lake, early morning' },
    { id: 1025, alt: 'Puppy', caption: 'Puppy portrait' },
    { id: 1039, alt: 'Desert road', caption: 'Desert highway' },
    { id: 1041, alt: 'Cliff', caption: 'Cliffs by the sea' },
    { id: 1035, alt: 'Rainbow', caption: 'Being in Awh' },
  ];
  private readonly selectedItemIndex = signal<number | null>(null);
  private readonly imageAspectRatio = 3 / 2;

  readonly selectedImageSize = signal(800);
  readonly images = computed<CarouselImage[]>(() => {
    const height = this.selectedImageSize();
    const width = Math.round(height * this.imageAspectRatio);

    return this.demoImages.map((image) => ({
      src: `https://picsum.photos/id/${image.id}/${width}/${height}`,
      alt: image.alt,
      caption: image.caption,
      width,
      height,
    }));
  });

  readonly selectedIndex = computed(() => {
    const index = this.selectedItemIndex();
    return index !== null && index < this.images().length ? index : null;
  });
  readonly selectedImage = computed(() => {
    const index = this.selectedIndex();
    return index === null ? null : this.images()[index] ?? null;
  });

  onSelectionChange(selection: CarouselSelection) {
    this.selectedItemIndex.set(selection.index);
  }

  onShuffle(): void {}

  setImageSize(size: number): void {
    this.selectedImageSize.set(size);
  }

  emptyCallback(_value?: number): void {}
}

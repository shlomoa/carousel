import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
import { ImagesService } from '../services/images.service';

const DEFAULT_IMAGE_WIDTH = 3;
const DEFAULT_IMAGE_HEIGHT = 2;
const DEFAULT_ASPECT_RATIO = DEFAULT_IMAGE_WIDTH / DEFAULT_IMAGE_HEIGHT;

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
  static readonly collectionSizeOptions = [2, 3, 4, 8, 16] as const;
  static readonly imageSizeOptions = [300, 500, 800, 1000] as const;

  private readonly imagesService = inject(ImagesService);
  private readonly selectedItemIndex = signal<number | null>(null);
  private readonly selectedCollectionSize = signal<number | null>(null);
  private readonly shuffledImageKeys = signal<readonly string[] | null>(null);

  readonly collectionSizeOptions = AppComponent.collectionSizeOptions;
  readonly imageSizeOptions = AppComponent.imageSizeOptions;
  readonly selectedImageSize = signal(800);
  readonly images = computed<CarouselImage[]>(() => {
    const height = this.selectedImageSize();
    let images = [...this.imagesService.images()];
    const shuffledImageKeys = this.shuffledImageKeys();

    if (shuffledImageKeys !== null) {
      const order = new Map(shuffledImageKeys.map((key, index) => [key, index]));

      images.sort(
        (left, right) =>
          (order.get(this.getImageKey(left)) ?? Number.MAX_SAFE_INTEGER) -
          (order.get(this.getImageKey(right)) ?? Number.MAX_SAFE_INTEGER),
      );
    }

    const collectionSize = this.selectedCollectionSize();
    const visibleImages = collectionSize === null ? images : images.slice(0, collectionSize);

    return visibleImages.map((image) => this.resizeImage(image, height));
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

  onShuffle(): void {
    const shuffledImageKeys = [...this.imagesService.images().map((image) => this.getImageKey(image))];

    for (let index = shuffledImageKeys.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffledImageKeys[index], shuffledImageKeys[swapIndex]] = [
        shuffledImageKeys[swapIndex],
        shuffledImageKeys[index],
      ];
    }

    this.shuffledImageKeys.set(shuffledImageKeys);
    this.selectedItemIndex.set(null);
  }

  setImageSize(size: number): void {
    this.selectedImageSize.set(size);
  }

  setCollectionSize(size?: number): void {
    this.selectedCollectionSize.set(size ?? null);
    this.selectedItemIndex.update((index) => this.getVisibleSelectedIndex(index, size));
  }

  private resizeImage(image: CarouselImage, height: number): CarouselImage {
    const width = Math.round(height * this.getAspectRatio(image));
    const id = this.getPicsumId(image.src);

    return {
      ...image,
      src: id === null ? image.src : `https://picsum.photos/id/${id}/${width}/${height}`,
      width,
      height,
    };
  }

  private getAspectRatio(image: CarouselImage): number {
    const width = image.width ?? DEFAULT_IMAGE_WIDTH;
    const height = image.height ?? DEFAULT_IMAGE_HEIGHT;

    return height > 0 ? width / height : DEFAULT_ASPECT_RATIO;
  }

  private getPicsumId(src: string): string | null {
    return src.match(/\/id\/([^/]+)\//)?.[1] ?? null;
  }

  private getImageKey(image: CarouselImage): string {
    return this.getPicsumId(image.src) ?? image.src;
  }

  private getVisibleSelectedIndex(index: number | null, collectionSize?: number): number | null {
    if (index === null || collectionSize === undefined) {
      return index;
    }

    return index < collectionSize ? index : null;
  }
}

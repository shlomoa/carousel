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
  static readonly COLLECTION_SIZE_OPTIONS = [2, 3, 4, 8, 16] as const;
  static readonly IMAGE_SIZE_OPTIONS = [300, 500, 800, 1000] as const;
  static readonly DEFAULT_COLLECTION_SIZE = AppComponent.COLLECTION_SIZE_OPTIONS[2];

  private readonly imagesService = inject(ImagesService);
  private readonly selectedItemIndex = signal<number | null>(null);
  private readonly selectedCollectionSize = signal<number>(AppComponent.DEFAULT_COLLECTION_SIZE);
  private readonly imageSet = signal<CarouselImage[]>(
    this.imagesService.getRandom(AppComponent.DEFAULT_COLLECTION_SIZE),
  );

  readonly collectionSizeOptions = AppComponent.COLLECTION_SIZE_OPTIONS;
  readonly imageSizeOptions = AppComponent.IMAGE_SIZE_OPTIONS;
  readonly selectedImageSize = signal(800);
  readonly images = computed<CarouselImage[]>(() => {
    const height = this.selectedImageSize();
    return this.imageSet().map((image) => this.resizeImage(image, height));
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
    this.imageSet.set(this.imagesService.getRandom(this.selectedCollectionSize()));
    this.selectedItemIndex.set(null);
  }

  setImageSize(size: number): void {
    this.selectedImageSize.set(size);
  }

  setCollectionSize(size?: number): void {
    const collectionSize = size ?? AppComponent.DEFAULT_COLLECTION_SIZE;

    this.selectedCollectionSize.set(collectionSize);
    this.imageSet.set(this.imagesService.getRandom(collectionSize));
    this.selectedItemIndex.set(null);
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
}

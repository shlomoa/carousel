import { Injectable, signal } from '@angular/core';
import { CarouselImage } from '@shlomoa/mat-image-carousel';

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 800;
const IMAGE_SCAN_START = 1;
const IMAGE_SCAN_END = 1500;
const IMAGE_SCAN_CONCURRENCY = 12;

const INITIAL_IMAGES: CarouselImage[] = [
  { src: 'https://picsum.photos/id/1015/1200/800', alt: 'Mountain lake', caption: 'Lake, early morning', width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
  { src: 'https://picsum.photos/id/1025/1200/800', alt: 'Puppy', caption: 'Puppy portrait', width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
  { src: 'https://picsum.photos/id/1039/1200/800', alt: 'Desert road', caption: 'Desert highway', width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
  { src: 'https://picsum.photos/id/1041/1200/800', alt: 'Cliff', caption: 'Cliffs by the sea', width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
];

@Injectable({ providedIn: 'root' })
export class ImagesService {
  private readonly imagesState = signal<CarouselImage[]>(INITIAL_IMAGES);

  readonly images = this.imagesState.asReadonly();

  constructor() {
    void this.scanImages();
  }

  private async scanImages(): Promise<void> {
    const pendingIds = Array.from(
      { length: IMAGE_SCAN_END - IMAGE_SCAN_START + 1 },
      (_, index) => IMAGE_SCAN_START + index,
    );
    const discoveredImages: Array<{ id: number; image: CarouselImage }> = [];

    await Promise.all(
      Array.from({ length: IMAGE_SCAN_CONCURRENCY }, async () => {
        while (pendingIds.length > 0) {
          const id = pendingIds.shift();

          if (id === undefined) {
            return;
          }

          const image = this.createScannedImage(id);

          if (await this.canLoadImage(image.src)) {
            discoveredImages.push({ id, image });
          }
        }
      }),
    );

    if (discoveredImages.length === 0) {
      return;
    }

    discoveredImages.sort((left, right) => left.id - right.id);

    this.imagesState.update((images) => this.mergeImages(images, discoveredImages.map(({ image }) => image)));
  }

  private createScannedImage(id: number): CarouselImage {
    return {
      src: `https://picsum.photos/id/${id}/${IMAGE_WIDTH}/${IMAGE_HEIGHT}`,
      alt: `Picsum image ${id}`,
      caption: `Picsum image ${id}`,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
    };
  }

  private canLoadImage(src: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const image = new Image();

      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });
  }

  private mergeImages(existingImages: CarouselImage[], discoveredImages: CarouselImage[]): CarouselImage[] {
    const uniqueImages = new Map<string, CarouselImage>();

    for (const image of [...existingImages, ...discoveredImages]) {
      if (!uniqueImages.has(image.src)) {
        uniqueImages.set(image.src, image);
      }
    }

    return Array.from(uniqueImages.values());
  }
}

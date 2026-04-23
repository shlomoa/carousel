import { fakeAsync, flush } from '@angular/core/testing';
import { ImagesService } from './images.service';

describe('ImagesService', () => {
  const originalImage = window.Image;

  function installImageMock(loadableIds: Set<number>) {
    class MockImage {
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;

      set src(value: string) {
        const id = Number(value.match(/\/id\/(\d+)\//)?.[1]);

        setTimeout(() => {
          if (loadableIds.has(id)) {
            this.onload?.();
            return;
          }

          this.onerror?.();
});
      }
    }

    Object.defineProperty(window, 'Image', {
      configurable: true,
      writable: true,
      value: MockImage,
    });
  }

  afterEach(() => {
    Object.defineProperty(window, 'Image', {
      configurable: true,
      writable: true,
      value: originalImage,
    });
  });

  it('starts with the seeded images before the scan resolves', () => {
    installImageMock(new Set());

    const service = new ImagesService();

    expect(service.images().length).toBe(4);
    expect(service.images().map((image) => image.src)).toEqual([
      'https://picsum.photos/id/1015/1200/800',
      'https://picsum.photos/id/1025/1200/800',
      'https://picsum.photos/id/1039/1200/800',
      'https://picsum.photos/id/1041/1200/800',
    ]);
  });

  it('appends scanned images that can be loaded and skips duplicates', fakeAsync(() => {
    installImageMock(new Set([1, 2, 1015]));

    const service = new ImagesService();

    flush(2000);

    expect(service.images().map((image) => image.src)).toEqual([
      'https://picsum.photos/id/1015/1200/800',
      'https://picsum.photos/id/1025/1200/800',
      'https://picsum.photos/id/1039/1200/800',
      'https://picsum.photos/id/1041/1200/800',
      'https://picsum.photos/id/1/1200/800',
      'https://picsum.photos/id/2/1200/800',
    ]);
  }));
});

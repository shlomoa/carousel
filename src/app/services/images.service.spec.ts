import { fakeAsync, flush } from '@angular/core/testing';
import { ImagesService } from './images.service';

describe('ImagesService', () => {
  const originalFetch = window.fetch;

  function installFetchMock(loadableIds: Set<number>) {
    window.fetch = jasmine
      .createSpy('fetch')
      .and.callFake((input: RequestInfo | URL) => {
        const value = input instanceof URL ? input.href : input.toString();
        const id = Number(value.match(/\/id\/(\d+)\/info$/)?.[1]);

        return Promise.resolve({
          ok: loadableIds.has(id),
        } as Response);
      });
  }

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it('starts with the seeded images before the scan resolves', () => {
    installFetchMock(new Set());

    const service = new ImagesService();

    expect(service.images().length).toBe(4);
    expect(service.images().map((image) => image.src)).toEqual([
      'https://picsum.photos/id/1015/1200/800',
      'https://picsum.photos/id/1025/1200/800',
      'https://picsum.photos/id/1039/1200/800',
      'https://picsum.photos/id/1041/1200/800',
    ]);
    expect(window.fetch).toHaveBeenCalledWith('https://picsum.photos/id/1/info');
  });

  it('appends scanned images that can be loaded and skips duplicates', fakeAsync(() => {
    installFetchMock(new Set([1, 2, 1015]));

    const service = new ImagesService();

    flush(2000);

    expect(window.fetch).toHaveBeenCalledTimes(1500);
    expect(window.fetch).toHaveBeenCalledWith('https://picsum.photos/id/1500/info');
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

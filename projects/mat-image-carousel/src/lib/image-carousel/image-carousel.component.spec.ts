import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { ImageCarouselComponent } from './image-carousel.component';
import { CarouselImage, CarouselSelection } from '../types';

describe('ImageCarouselComponent', () => {
  let fixture: ComponentFixture<ImageCarouselComponent>;
  let component: ImageCarouselComponent;

  beforeAll(() => {
    const href = 'https://example.com';
    if (!document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = '';
      document.head.append(link);
    }
  });

  const createImages = (count: number): CarouselImage[] =>
    Array.from({ length: count }, (_, i) => ({
      src: `https://example.com/${i + 1}.jpg`,
      alt: `Photo ${i + 1}`,
    }));

  const configure = (images: CarouselImage[]) => {
    fixture.componentRef.setInput('images', images);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCarouselComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCarouselComponent);
    component = fixture.componentInstance;
  });

  it('initializes with a pre-rotated slide order', () => {
    configure(createImages(4));
    expect(component.slides().map((slide) => slide.itemIndex)).toEqual([3, 0, 1, 2]);
    expect(component.currentIndex()).toBe(1);
    expect(component.currentItemIndex()).toBe(0);
    expect(component.visibleThumbnailIndexes()).toEqual([3, 0, 1]);
  });

  it('computes visible thumbnails relative to the current logical item', fakeAsync(() => {
    configure(createImages(5));
    expect(component.visibleThumbnailIndexes()).toEqual([4, 0, 1]);

    const flushAnimations = () => {
      flush();
      fixture.detectChanges();
    };

    component.goToItem(2);
    flushAnimations();
    expect(component.visibleThumbnailIndexes()).toEqual([1, 2, 3]);

    component.prev();
    flushAnimations();
    expect(component.visibleThumbnailIndexes()).toEqual([0, 1, 2]);
  }));

  it('cycles forward across the boundary by shuffling slides', fakeAsync(() => {
    configure(createImages(4));

    const flushAnimations = () => {
      flush();
      fixture.detectChanges();
    };

    const forwardOrderAfter = (steps: number) => {
      for (let i = 0; i < steps; i += 1) {
        component.next();
        flushAnimations();
      }
      return component.slides().map((slide) => slide.itemIndex);
    };

    expect(forwardOrderAfter(1)).toEqual([3, 0, 1, 2]);
    expect(component.currentItemIndex()).toBe(1);

    expect(forwardOrderAfter(1)).toEqual([3, 0, 1, 2]);
    expect(component.currentItemIndex()).toBe(2);

    expect(forwardOrderAfter(1)).toEqual([0, 1, 2, 3]);
    expect(component.currentItemIndex()).toBe(3);

    expect(forwardOrderAfter(1)).toEqual([1, 2, 3, 0]);
    expect(component.currentItemIndex()).toBe(0);
  }));

  it('cycles backward across the boundary by shuffling slides', fakeAsync(() => {
    configure(createImages(4));

    const flushAnimations = () => {
      flush();
      fixture.detectChanges();
    };

    const backwardOrderAfter = (steps: number) => {
      for (let i = 0; i < steps; i += 1) {
        component.prev();
        flushAnimations();
      }
      return component.slides().map((slide) => slide.itemIndex);
    };

    expect(backwardOrderAfter(1)).toEqual([3, 0, 1, 2]);
    expect(component.currentItemIndex()).toBe(3);

    expect(backwardOrderAfter(1)).toEqual([2, 3, 0, 1]);
    expect(component.currentItemIndex()).toBe(2);

    expect(backwardOrderAfter(1)).toEqual([1, 2, 3, 0]);
    expect(component.currentItemIndex()).toBe(1);

    expect(backwardOrderAfter(1)).toEqual([0, 1, 2, 3]);
    expect(component.currentItemIndex()).toBe(0);
  }));

  it('routes goToItem requests through the navigation queue', fakeAsync(() => {
    configure(createImages(5));
    const flushAnimations = () => {
      flush();
      fixture.detectChanges();
    };

    component.goToItem(3);
    flushAnimations();
    expect(component.currentItemIndex()).toBe(3);

    component.goToItem(1);
    flushAnimations();
    expect(component.currentItemIndex()).toBe(1);
  }));

  it('routes goTo requests through shuffle-based navigation', fakeAsync(() => {
    configure(createImages(4));
    const flushAnimations = () => {
      flush();
      fixture.detectChanges();
    };

    component.goTo(3);
    flushAnimations();
    expect(component.currentItemIndex()).toBe(2);

    component.goTo(1);
    flushAnimations();
    expect(component.currentItemIndex()).toBe(0);
  }));

  it('emits selectionChange when the selected index changes', () => {
    const images = createImages(3);
    configure(images);
    const emitted: CarouselSelection[] = [];
    const sub = component.selectionChange.subscribe((selection) => emitted.push(selection));

    component.selectedIndex.set(1);
    fixture.detectChanges();

    expect(emitted).toEqual([
      {
        index: 1,
        image: images[1],
      },
    ]);
    sub.unsubscribe();
  });

  it('ignores goTo calls outside the current slide range', fakeAsync(() => {
    configure(createImages(3));
    const flushAnimations = () => {
      flush();
      fixture.detectChanges();
    };

    const initialItem = component.currentItemIndex();
    component.goTo(99);
    flushAnimations();
    expect(component.currentItemIndex()).toBe(initialItem);
  }));

  it('clears carousel state when no images are provided', () => {
    configure([]);
    expect(component.visibleThumbnailIndexes()).toEqual([]);
    expect(component.currentItemIndex()).toBeNull();
    expect(component.activeDescendantId()).toBeNull();
  });

  it('clamps state when the image set shrinks', fakeAsync(() => {
    configure(createImages(4));
    const flushAnimations = () => {
      flush();
      fixture.detectChanges();
    };

    component.goToItem(3);
    flushAnimations();

    fixture.componentRef.setInput('images', createImages(2));
    fixture.detectChanges();

    expect(component.currentIndex()).toBe(1);
    expect(component.currentItemIndex()).toBe(1);
    expect(component.visibleThumbnailIndexes()).toEqual([0, 1]);
  }));

  it('keeps slides aligned with the source images when inputs change', () => {
    const images = createImages(3);
    configure(images);
    expect(component.slides().map((slide) => slide.itemIndex)).toEqual([2, 0, 1]);

    const updated = [...images, { src: 'https://example.com/4.jpg', alt: 'Photo 4' }];
    fixture.componentRef.setInput('images', updated);
    fixture.detectChanges();

    expect(component.slides().map((slide) => slide.itemIndex)).toEqual([3, 0, 1, 2]);
    expect(component.currentIndex()).toBe(1);
    expect(component.currentItemIndex()).toBe(0);
  });
});
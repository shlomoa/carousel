import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CarouselSelectorComponent } from './carousel-selector.component';
import { CarouselImage } from '../types';

describe('CarouselSelectorComponent', () => {
  let fixture: ComponentFixture<CarouselSelectorComponent>;

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

  const baseImages: CarouselImage[] = [
    { src: 'https://example.com/a.jpg', alt: 'A' },
    { src: 'https://example.com/b.jpg', caption: 'B caption' },
    { src: 'https://example.com/c.jpg', alt: 'C', thumbnailSrc: 'https://example.com/c-thumb.jpg' },
  ];

  const setStandardInputs = (overrides: Partial<{
    images: CarouselImage[];
    visibleIndexes: number[];
    currentIndex: number;
    selectedIndex: number | null;
    selectionPulse: number;
  }> = {}) => {
    const defaults = {
      images: baseImages,
      visibleIndexes: [0, 1, 2],
      currentIndex: 1,
      selectedIndex: null as number | null,
      selectionPulse: 0,
    };
    const values = { ...defaults, ...overrides };
    fixture.componentRef.setInput('images', values.images);
    fixture.componentRef.setInput('visibleIndexes', values.visibleIndexes);
    fixture.componentRef.setInput('currentIndex', values.currentIndex);
    fixture.componentRef.setInput('selectedIndex', values.selectedIndex);
    fixture.componentRef.setInput('selectionPulse', values.selectionPulse);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselSelectorComponent);
  });

  it('renders one thumbnail per visible index', () => {
    setStandardInputs();
    const thumbs = fixture.debugElement.queryAll(By.css('button.selector__thumb'));
    expect(thumbs.length).toBe(3);
  });

  it('falls back to the main image source when no thumbnail is provided', () => {
    setStandardInputs({ visibleIndexes: [1] });
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(baseImages[1].src);
  });

  it('applies the dedicated thumbnail source when available', () => {
    setStandardInputs({ visibleIndexes: [2], currentIndex: 2 });
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('https://example.com/c-thumb.jpg');
  });

  it('does not render deprecated NgOptimizedImage fill or priority attributes on thumbnails', () => {
    setStandardInputs();
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.hasAttribute('fill')).toBeFalse();
    expect(img.hasAttribute('priority')).toBeFalse();
  });

  it('emits navigateTo when a thumbnail is clicked', () => {
    setStandardInputs({ visibleIndexes: [0, 1, 2], currentIndex: 0 });
    const navigateSpy = jasmine.createSpy();
    const subscription = fixture.componentInstance.navigateTo.subscribe(navigateSpy);
    const target = fixture.debugElement.queryAll(By.css('button.selector__thumb'))[1];
    target.triggerEventHandler('click');
    expect(navigateSpy).toHaveBeenCalledOnceWith(1);
    subscription.unsubscribe();
  });

  it('wraps to the last image when navigating previous from the first image', () => {
    setStandardInputs({ currentIndex: 0 });
    const navigateSpy = jasmine.createSpy();
    const subscription = fixture.componentInstance.navigateTo.subscribe(navigateSpy);
    const buttons = fixture.debugElement.queryAll(By.css('button.selector__button'));
    const previousButton = buttons[0];
    previousButton.triggerEventHandler('click');
    expect(navigateSpy).toHaveBeenCalledOnceWith(baseImages.length - 1);
    subscription.unsubscribe();
  });

  it('wraps to the first image when navigating next from the last image', () => {
    setStandardInputs({ currentIndex: baseImages.length - 1 });
    const navigateSpy = jasmine.createSpy();
    const subscription = fixture.componentInstance.navigateTo.subscribe(navigateSpy);
    const buttons = fixture.debugElement.queryAll(By.css('button.selector__button'));
    const nextButton = buttons[1];
    nextButton.triggerEventHandler('click');
    expect(navigateSpy).toHaveBeenCalledOnceWith(0);
    subscription.unsubscribe();
  });
});
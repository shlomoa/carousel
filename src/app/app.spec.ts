import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { AppComponent } from './components/app.component';
import { CarouselImage, CarouselSelection, ImageCarouselComponent } from '@shlomoa/mat-image-carousel';
import { ImagesService } from './services/images.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  const testImages: CarouselImage[] = [
    { src: 'https://picsum.photos/id/10/1200/800', alt: 'Test image 1', width: 1200, height: 800 },
    { src: 'https://picsum.photos/id/11/1200/800', alt: 'Test image 2', width: 1200, height: 800 },
  ];

  beforeAll(() => {
    const href = 'https://picsum.photos';
    if (!document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = '';
      document.head.append(link);
    }
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {
          provide: ImagesService,
          useValue: {
            images: signal(testImages),
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the shell', () => {
    expect(component).toBeTruthy();
  });

  it('initializes with a list of images', () => {
    expect(component.images()).toEqual(testImages);
    const carouselDebugEl = fixture.debugElement.query(By.directive(ImageCarouselComponent));
    expect(carouselDebugEl).toBeTruthy();
  });

  it('updates selection state when carousel emits selection change', () => {
    const carouselDebugEl = fixture.debugElement.query(By.directive(ImageCarouselComponent));
    const firstImage = component.images()[0];
    const selection = { index: 0, image: firstImage } as CarouselSelection;

    carouselDebugEl.componentInstance.selectionChange.emit(selection);
    fixture.detectChanges();

    expect(component.selectedIndex()).toBe(0);
    expect(component.selectedImage()).toBe(firstImage);
  });

  it('renders resolved selection details in the DOM', () => {
    const secondImage = component.images()[1];
    const selection = { index: 1, image: secondImage } as CarouselSelection;
    component.onSelectionChange(selection);
    fixture.detectChanges();

    const detailsElement = fixture.debugElement.query(By.css('selection-details'));
    expect(detailsElement).toBeTruthy();
    const detailsInstance = detailsElement.componentInstance;
    expect(detailsInstance.index()).toBe(1);
    expect(detailsInstance.image()).toEqual(secondImage);
  });

  it('updates the generated image dimensions when a size is selected', () => {
    component.setImageSize(300);
    fixture.detectChanges();

    const firstImage = component.images()[0];
    expect(firstImage.src).toContain('/450/300');
    expect(firstImage.width).toBe(450);
    expect(firstImage.height).toBe(300);
  });

  it('keeps the current selection synced with resized images', () => {
    component.onSelectionChange({ index: 1, image: component.images()[1] } as CarouselSelection);
    component.setImageSize(1000);
    fixture.detectChanges();

    const selectedImage = component.selectedImage();
    expect(component.selectedIndex()).toBe(1);
    expect(selectedImage?.src).toContain('/1500/1000');
    expect(selectedImage?.width).toBe(1500);
    expect(selectedImage?.height).toBe(1000);
  });

  it('limits the visible images when a collection size is selected', () => {
    component.onSelectionChange({ index: 1, image: component.images()[1] } as CarouselSelection);
    component.setCollectionSize(1);
    fixture.detectChanges();

    expect(component.images().length).toBe(1);
    expect(component.selectedIndex()).toBeNull();
    expect(component.selectedImage()).toBeNull();
  });

  it('shuffles the image order and clears the current selection', () => {
    spyOn(Math, 'random').and.returnValues(0, 0);
    component.onSelectionChange({ index: 0, image: component.images()[0] } as CarouselSelection);

    component.onShuffle();
    fixture.detectChanges();

    expect(component.selectedIndex()).toBeNull();
    expect(component.selectedImage()).toBeNull();
    expect(component.images().map((image) => image.src)).toEqual([
      'https://picsum.photos/id/11/1200/800',
      'https://picsum.photos/id/10/1200/800',
    ]);
  });
});

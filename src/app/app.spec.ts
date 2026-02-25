import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppComponent } from './components/app.component';
import { CarouselSelection, ImageCarouselComponent } from '@shlomoa/mat-image-carousel';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

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
    expect(component.images().length).toBeGreaterThan(0);
    const carouselDebugEl = fixture.debugElement.query(By.directive(ImageCarouselComponent));
    expect(carouselDebugEl).toBeTruthy();
  });

  it('updates selection state when carousel emits selection change', () => {
    // Find the carousel component
    const carouselDebugEl = fixture.debugElement.query(By.directive(ImageCarouselComponent));
    
    // Create a mock selection event
    const firstImage = component.images()[0];
    const selection = { index: 0, image: firstImage } as CarouselSelection;

    // Trigger the output event
    carouselDebugEl.componentInstance.selectionChange.emit(selection);
    fixture.detectChanges();

    // Verify component state updated
    expect(component.selectedIndex()).toBe(0);
    expect(component.selectedImage()).toBe(firstImage);
  });

  it('renders resolved selection details in the DOM', () => {
    // Manually trigger selection change
    const secondImage = component.images()[1];
    const selection = { index: 1, image: secondImage } as CarouselSelection;
    component.onSelectionChange(selection);
    fixture.detectChanges();

    // Verify DOM updates
    // The selection-details component renders inside the app.component template.
    // We check if the text content reflects the selected image.
    const detailsElement = fixture.debugElement.query(By.css('selection-details'));
    expect(detailsElement).toBeTruthy();
    
    // Since selection-details uses shadow DOM or projection, we might need to check its text content or inputs.
    // But checking inputs is safer for integration if we don't want to rely on child's implementation details too much.
    // However, checking rendered text is darker integration.
    
    // Let's check inputs of the child component
    const detailsInstance = detailsElement.componentInstance;
    expect(detailsInstance.index()).toBe(1);
    expect(detailsInstance.image()).toEqual(secondImage);
  });
});

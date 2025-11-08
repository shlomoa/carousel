import { TestBed } from '@angular/core/testing';
import { AppComponent } from './components/app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('creates the shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('renders the carousel', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('image-carousel')).toBeTruthy();
  });

  it('renders the uplevel control', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('uplevel')).toBeTruthy();
  });
});

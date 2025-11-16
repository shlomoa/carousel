import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UplevelComponent } from './uplevel.component';

describe('UplevelComponent', () => {
  let fixture: ComponentFixture<UplevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UplevelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UplevelComponent);
  });

  it('creates the control', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits activated on click', () => {
    const spy = jasmine.createSpy();
    const subscription = fixture.componentInstance.activated.subscribe(spy);
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(spy).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
  });
});
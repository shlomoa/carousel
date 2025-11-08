import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UplevelComponent } from './uplevel.component';

describe('UplevelComponent', () => {
  let fixture: ComponentFixture<UplevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UplevelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UplevelComponent);
    fixture.detectChanges();
  });

  it('renders the arrow button', () => {
    const button = fixture.debugElement.query(By.css('button.uplevel__button'));
    expect(button).withContext('Expected uplevel button to render').not.toBeNull();
  });

  it('emits activated when clicked', () => {
    const spy = jasmine.createSpy('activated');
    const component = fixture.componentInstance;
    const subscription = component.activated.subscribe(spy);

    const button = fixture.debugElement.query(By.css('button.uplevel__button'));
    button.triggerEventHandler('click');

    expect(spy).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
  });
});

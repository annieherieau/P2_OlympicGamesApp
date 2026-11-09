import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display Loading... in a status element', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[role="status"]')?.textContent?.trim()).toBe('Loading...');
  });

  it('should hide the decorative animation from assistive technology', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[role="status"] .spinner')?.getAttribute('aria-hidden'))
      .toBe('true');
  });
});

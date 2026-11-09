import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Go back');
    fixture.componentRef.setInput('link', '/');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function link(): HTMLAnchorElement {
    const element: HTMLElement = fixture.nativeElement;
    return element.querySelector('a')!;
  }

  it('should display the label and generate the link', () => {
    expect(link().textContent?.trim()).toBe('Go back');
    expect(link().getAttribute('href')).toBe('/');
  });

  for (const classes of ['primary rounded', ['primary', 'rounded']]) {
    it(`should apply classes as ${typeof classes === 'string' ? 'a string' : 'an array'} and keep the button class`, () => {
      fixture.componentRef.setInput('classes', classes);
      fixture.detectChanges();
      expect(Array.from(link().classList).sort()).toEqual(['button', 'primary', 'rounded']);
    });
  }

  it('should update the label, link and classes when inputs change', () => {
    fixture.componentRef.setInput('classes', 'primary rounded');
    fixture.detectChanges();
    expect(link().classList.contains('primary')).toBeTrue();
    fixture.componentRef.setInput('label', 'France');
    fixture.componentRef.setInput('link', '/country/7');
    fixture.componentRef.setInput('classes', ['secondary']);
    fixture.detectChanges();
    expect(link().textContent?.trim()).toBe('France');
    expect(link().getAttribute('href')).toBe('/country/7');
    expect(Array.from(link().classList).sort()).toEqual(['button', 'secondary']);
    fixture.componentRef.setInput('classes', '');
    fixture.detectChanges();
    expect(Array.from(link().classList)).toEqual(['button']);
  });
});

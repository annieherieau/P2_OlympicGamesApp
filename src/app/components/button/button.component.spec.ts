import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink } from '@angular/router';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Go back');
    fixture.componentRef.setInput('link', '/');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function button(): HTMLButtonElement {
    const element: HTMLElement = fixture.nativeElement;
    return element.querySelector('button')!;
  }

  function targetUrl(): string {
    const routerLink = fixture.debugElement
      .query(By.directive(RouterLink))
      .injector.get(RouterLink);
    return TestBed.inject(Router).serializeUrl(routerLink.urlTree!);
  }

  it('should display the label and target the home page', () => {
    expect(button().textContent?.trim()).toBe('Go back');
    expect(targetUrl()).toBe('/');
  });

  it('should update the label and link when inputs change', () => {
    fixture.componentRef.setInput('label', 'France');
    fixture.componentRef.setInput('link', '/country/7');
    fixture.detectChanges();
    expect(button().textContent?.trim()).toBe('France');
    expect(targetUrl()).toBe('/country/7');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';

import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let routeStub: {
    snapshot: { paramMap: ReturnType<typeof convertToParamMap> };
  };

  beforeEach(async () => {
    routeStub = { snapshot: { paramMap: convertToParamMap({}) } };
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: routeStub,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the default error when the route has no error parameter', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.center h2')?.textContent).toContain(
      'No corresponding page found',
    );
  });

  it('should display the error provided by the route', () => {
    routeStub.snapshot.paramMap = convertToParamMap({
      error: 'Country not found',
    });

    const errorFixture = TestBed.createComponent(NotFoundComponent);
    errorFixture.detectChanges();

    const element = errorFixture.nativeElement as HTMLElement;
    expect(element.querySelector('.center h2')?.textContent).toContain(
      'Country not found',
    );
  });

  it('should provide a link back to the home page', () => {
    const element = fixture.nativeElement as HTMLElement;
    const link = element.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/');
    expect(link?.textContent).toContain('Go back');
  });
});

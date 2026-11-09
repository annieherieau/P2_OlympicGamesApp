import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CountryComponent } from './country.component';
import { DataService } from 'src/app/core/services/data.service';

describe('CountryComponent', () => {
  let component: CountryComponent;
  let fixture: ComponentFixture<CountryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryComponent],

      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: '1' }) },
            paramMap: of(convertToParamMap({ id: '1' }))
          }
        },
        {
          provide: DataService,
          useValue: {
            getCountryById: jasmine
              .createSpy('getCountryById')
              .and.returnValue(
                of({
                  id: 1,
                  country: 'France',
                  participations: []
                })
              )
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the country identified by the route', () => {
    expect(TestBed.inject(DataService).getCountryById).toHaveBeenCalledWith(1);
  });

  it('should display the empty state when the country has no participations', () => {
    expect(component.state).toBe('empty');
  });
});

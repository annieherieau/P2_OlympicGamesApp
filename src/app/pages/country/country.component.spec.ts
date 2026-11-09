import { HttpErrorResponse } from '@angular/common/http';
import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter, Router } from '@angular/router';
import { finalize, Subject } from 'rxjs';
import { CountryChartComponent } from 'src/app/components/country-chart/country-chart.component';
import { ErrorComponent } from 'src/app/components/error/error.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Olympic } from 'src/app/core/models/olympic.model';
import { Participation } from 'src/app/core/models/participation.model';
import { DataService } from 'src/app/core/services/data.service';
import { CountryComponent } from './country.component';

@Component({
  selector: 'app-country-chart',
  standalone: true,
  template: '',
})
class CountryChartStubComponent {
  readonly data = input<Participation[]>([]);
}

describe('CountryComponent', () => {
  let component: CountryComponent;
  let fixture: ComponentFixture<CountryComponent>;
  let params$: Subject<ParamMap>;
  let country$: Subject<Olympic | undefined>;
  let nextCountry$: Subject<Olympic | undefined>;
  let service: jasmine.SpyObj<DataService>;
  let navigate: jasmine.Spy;
  let stopParams: jasmine.Spy;
  let stopCountry: jasmine.Spy;
  let country: Olympic;

  async function render(): Promise<void> {
    // Attend les notifications différées par observeOn(asapScheduler).
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function selectCountry(id: string | null = '7'): void {
    params$.next(convertToParamMap(id === null ? {} : { id }));
  }

  function chart(): CountryChartStubComponent {
    return fixture.debugElement.query(By.directive(CountryChartStubComponent))
      .componentInstance as CountryChartStubComponent;
  }

  function header(): HeaderComponent {
    return fixture.debugElement.query(By.directive(HeaderComponent))
      .componentInstance as HeaderComponent;
  }

  function expectNoChartOrSpinner(): void {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-country-chart')).toBeNull();
    expect(element.querySelector('app-spinner')).toBeNull();
  }

  beforeEach(async () => {
    params$ = new Subject<ParamMap>();
    country$ = new Subject<Olympic | undefined>();
    nextCountry$ = new Subject<Olympic | undefined>();
    stopParams = jasmine.createSpy('stopParams');
    stopCountry = jasmine.createSpy('stopCountry');
    service = jasmine.createSpyObj<DataService>('DataService', ['getCountryById']);
    service.getCountryById.and.returnValue(country$.pipe(finalize(stopCountry)));
    country = {
      id: 7,
      country: 'France',
      participations: [
        { id: 1, year: 2012, city: 'London', medalsCount: 3, athleteCount: 10 },
        { id: 2, year: 2016, city: 'Rio', medalsCount: 5, athleteCount: 20 },
      ],
    };

    await TestBed.configureTestingModule({
      imports: [CountryComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params$.pipe(finalize(stopParams)) } },
        { provide: DataService, useValue: service },
      ],
    })
      .overrideComponent(CountryComponent, {
        remove: { imports: [CountryChartComponent] },
        add: { imports: [CountryChartStubComponent] },
      })
      .compileComponents();

    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(CountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    params$.complete();
    country$.complete();
    nextCountry$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the country identified by the route and show the spinner until it responds', () => {
    selectCountry();

    expect(service.getCountryById).toHaveBeenCalledOnceWith(7);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-spinner')).not.toBeNull();
    expect(element.querySelector('app-country-chart')).toBeNull();
    expect(element.querySelector('app-error')).toBeNull();
  });

  it('should display the country name and pass its participations to the chart', async () => {
    selectCountry();
    country$.next(country);
    await render();

    expect(header().titlePage).toBe('France');
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h2')?.textContent?.trim()).toBe('France');
    expect(chart().data()).toEqual(country.participations);
    expect(element.querySelector('app-spinner')).toBeNull();
    expect(element.querySelector('app-error')).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should pass participation, medal and athlete totals to the header', async () => {
    selectCountry();
    country$.next(country);
    await render();

    expect(header().kpiList).toEqual([
      { label: 'Number of entries', value: 2 },
      { label: 'Total Number of medals', value: 8 },
      { label: 'Total Number of athletes', value: 30 },
    ]);
  });

  it('should display No data. without a chart for a country with no participations', async () => {
    selectCountry();
    country$.next({ ...country, participations: [] });
    await render();

    expect(component.state).toBe('empty');
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('p')?.textContent?.trim()).toBe('No data.');
    expect(element.querySelector('app-error')).toBeNull();
    expectNoChartOrSpinner();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should redirect when the country does not exist', async () => {
    selectCountry();
    country$.next(undefined);
    await render();

    expect(navigate).toHaveBeenCalledOnceWith(['/not-found', 'Country not found']);
  });

  for (const id of [null, 'abc', '0', '-1', '1.5']) {
    it(`should redirect without calling the service for invalid ID ${String(id)}`, async () => {
      selectCountry(id);
      await render();

      expect(service.getCountryById).not.toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledOnceWith(['/not-found', 'Country not found']);
    });
  }

  for (const [status, message] of [
    [0, 'Unable to reach the server. Please check your connection.'],
    [404, 'The requested data could not be found.'],
    [500, 'The service is temporarily unavailable. Please try again later.'],
    [502, 'The service is temporarily unavailable. Please try again later.'],
    [503, 'The service is temporarily unavailable. Please try again later.'],
    [400, 'Unable to load the data. Please try again.'],
  ] as const) {
    it(`should display the appropriate HTTP ${status} error without a chart or spinner`, async () => {
      selectCountry();
      country$.error(new HttpErrorResponse({ status }));
      await render();

      const error = fixture.debugElement.query(By.directive(ErrorComponent));
      expect(error).not.toBeNull();
      expect((error.componentInstance as ErrorComponent).error).toBe(message);
      const element: HTMLElement = error.nativeElement;
      expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(message);
      expectNoChartOrSpinner();
      expect(navigate).not.toHaveBeenCalled();
    });
  }

  it('should update the title, chart and KPIs when the route changes in the same instance', async () => {
    selectCountry();
    country$.next(country);
    await render();

    service.getCountryById.and.returnValue(nextCountry$);
    selectCountry('42');
    const italy: Olympic = {
      id: 42,
      country: 'Italy',
      participations: [
        { id: 3, year: 2020, city: 'Tokyo', medalsCount: 12, athleteCount: 40 },
      ],
    };
    nextCountry$.next(italy);
    await render();

    expect(service.getCountryById.calls.allArgs()).toEqual([[7], [42]]);
    expect(header().titlePage).toBe('Italy');
    expect(chart().data()).toEqual(italy.participations);
    expect(header().kpiList).toEqual([
      { label: 'Number of entries', value: 1 },
      { label: 'Total Number of medals', value: 12 },
      { label: 'Total Number of athletes', value: 40 },
    ]);
  });

  it('should cancel request A and ignore its late response after selecting B', async () => {
    selectCountry();
    service.getCountryById.and.returnValue(nextCountry$);
    selectCountry('42');
    expect(stopCountry).toHaveBeenCalledTimes(1);
    const italy: Olympic = { ...country, id: 42, country: 'Italy' };
    nextCountry$.next(italy);
    await render();

    country$.next(country);
    await render();

    expect(header().titlePage).toBe('Italy');
    expect(chart().data()).toEqual(italy.participations);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should link Go back to the home page', () => {
    const element: HTMLElement = fixture.nativeElement;
    const link = Array.from(element.querySelectorAll('a')).find(
      (anchor) => anchor.textContent?.trim() === 'Go back',
    );
    expect(link).toBeDefined();
    expect(link?.getAttribute('href')).toBe('/');
  });

  it('should unsubscribe from route parameters and the pending request on destruction', async () => {
    selectCountry();
    expect(stopParams).not.toHaveBeenCalled();
    expect(stopCountry).not.toHaveBeenCalled();
    fixture.destroy();

    expect(stopParams).toHaveBeenCalledTimes(1);
    expect(stopCountry).toHaveBeenCalledTimes(1);
    selectCountry('42');
    country$.next(country);
    await fixture.whenStable();

    expect(service.getCountryById).toHaveBeenCalledOnceWith(7);
    expect(component.state).toBe('loading');
    expect(component.data).toEqual([]);
    expect(component.kpiList).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should cancel a response already scheduled when destroyed', async () => {
    selectCountry();
    country$.next(country);
    fixture.destroy();
    await fixture.whenStable();

    expect(component.state).toBe('loading');
    expect(component.titlePage).toBe('');
    expect(component.data).toEqual([]);
    expect(component.kpiList).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
  });
});

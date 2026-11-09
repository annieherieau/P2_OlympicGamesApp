import { HttpErrorResponse } from '@angular/common/http';
import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { finalize, Subject } from 'rxjs';
import { ErrorComponent } from 'src/app/components/error/error.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { MedalsChartComponent } from 'src/app/components/medals-chart/medals-chart.component';
import { Olympic } from 'src/app/core/models/olympic.model';
import { DataService } from 'src/app/core/services/data.service';

import { HomeComponent } from './home.component';

@Component({
  selector: 'app-medals-chart',
  standalone: true,
  template: '',
})
class MedalsChartStubComponent {
  readonly data = input<Olympic[]>([]);
  readonly countryId = output<number>();
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let countries$: Subject<Olympic[]>;
  let service: jasmine.SpyObj<DataService>;
  let countries: Olympic[];
  let onUnsubscribe: jasmine.Spy;

  // Attend le traitement différé par observeOn(asapScheduler), puis actualise le DOM.
  async function renderCountries(data: Olympic[]): Promise<void> {
    countries$.next(data);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    countries$ = new Subject<Olympic[]>();
    service = jasmine.createSpyObj<DataService>('DataService', ['getCountries']);
    onUnsubscribe = jasmine.createSpy('onUnsubscribe');
    service.getCountries.and.returnValue(
      countries$.pipe(finalize(onUnsubscribe)),
    );
    countries = [
      {
        id: 7,
        country: 'France',
        participations: [
          { id: 1, year: 2012, city: 'London', medalsCount: 3, athleteCount: 10 },
          { id: 2, year: 2016, city: 'Rio', medalsCount: 5, athleteCount: 20 },
        ],
      },
      {
        id: 42,
        country: 'Italy',
        participations: [
          { id: 3, year: 2012, city: 'London', medalsCount: 2, athleteCount: 15 },
          { id: 4, year: 2016, city: 'Rio', medalsCount: 4, athleteCount: 25 },
        ],
      },
    ];

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), { provide: DataService, useValue: service }],
    })
      .overrideComponent(HomeComponent, {
        remove: { imports: [MedalsChartComponent] },
        add: { imports: [MedalsChartStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    countries$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the spinner and no chart while waiting for countries', () => {
    expect(service.getCountries).toHaveBeenCalledTimes(1);
    expect(component.state).toBe('loading');
    expect(fixture.nativeElement.querySelector('app-spinner')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-medals-chart')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-error')).toBeNull();
  });

  it('should pass the countries to the chart and hide the spinner on success', async () => {
    await renderCountries(countries);

    const chart = fixture.debugElement.query(By.directive(MedalsChartStubComponent));
    expect(component.state).toBe('success');
    expect(chart).not.toBeNull();
    const chartComponent = chart.componentInstance as MedalsChartStubComponent;
    expect(chartComponent.data()).toEqual(countries);
    expect(fixture.nativeElement.querySelector('app-spinner')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-error')).toBeNull();
  });

  it('should pass country and distinct Olympic year counts to the header', async () => {
    await renderCountries(countries);

    const header = fixture.debugElement.query(By.directive(HeaderComponent));
    const headerComponent = header.componentInstance as HeaderComponent;
    expect(headerComponent.kpiList).toEqual([
      { label: 'Number of countries', value: 2 },
      { label: 'Number of JOs', value: 2 },
    ]);
  });

  it('should display the empty state when no countries are returned', async () => {
    await renderCountries([]);

    expect(component.state).toBe('empty');
    expect(component.error).toBe('No Olympic data found');
    expect(fixture.nativeElement.querySelector('p')?.textContent.trim()).toBe('No data.');
    expect(fixture.nativeElement.querySelector('app-medals-chart')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-spinner')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-error')).toBeNull();
  });

  it('should display the HTTP error message without a chart or spinner', async () => {
    countries$.error(new HttpErrorResponse({ status: 503, statusText: 'Service Unavailable' }));
    await fixture.whenStable();
    fixture.detectChanges();

    const message = 'The service is temporarily unavailable. Please try again later.';
    const error = fixture.debugElement.query(By.directive(ErrorComponent));
    expect(component.state).toBe('error');
    expect(error).not.toBeNull();
    expect(error.componentInstance.error).toBe(message);
    expect(error.nativeElement.querySelector('[role="alert"]').textContent.trim()).toBe(message);
    expect(fixture.nativeElement.querySelector('app-medals-chart')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-spinner')).toBeNull();
  });

  it('should navigate to the selected country', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    component.onCountryId(1);
    expect(navigate).toHaveBeenCalledOnceWith(['/country', 1]);
  });

  it('should navigate when the chart emits a country ID', async () => {
    await renderCountries(countries);
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const chart = fixture.debugElement.query(By.directive(MedalsChartStubComponent));

    const chartComponent = chart.componentInstance as MedalsChartStubComponent;
    chartComponent.countryId.emit(42);

    expect(navigate).toHaveBeenCalledOnceWith(['/country', 42]);
  });

  it('should unsubscribe and ignore a service response after destruction', async () => {
    expect(onUnsubscribe).not.toHaveBeenCalled();
    fixture.destroy();
    expect(onUnsubscribe).toHaveBeenCalledTimes(1);
    countries$.next(countries);
    await fixture.whenStable();

    expect(component.state).toBe('loading');
    expect(component.data).toEqual([]);
    expect(component.kpiList).toEqual([]);
  });

  it('should cancel a response already scheduled when destroyed', async () => {
    countries$.next(countries);
    fixture.destroy();
    await fixture.whenStable();

    expect(component.state).toBe('loading');
    expect(component.data).toEqual([]);
    expect(component.kpiList).toEqual([]);
  });
});

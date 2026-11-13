import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Olympic } from '../models/olympic.model';
import { DataService } from './data.service';

describe('DataService', () => {
  const url = './assets/mock/olympic.json';
  let service: DataService;
  let http: HttpTestingController;

  function country(id: number, name: string): Olympic {
    return { id, country: name, participations: [] };
  }

  function unexpectedError(error: unknown): void {
    fail(`Unexpected error: ${String(error)}`);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LOCALE_ID, useValue: 'fr-FR' },
      ],
    });
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should not request data before the first subscription', () => {
    service.getCountries();
    service.getCountryById(42);
    http.expectNone(url);
  });

  it('should GET the Olympic data when subscribed', () => {
    const next = jasmine.createSpy('next');
    service.getCountries().subscribe({ next, error: unexpectedError });
    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    const countries = [country(7, 'France')];
    request.flush(countries);
    expect(next).toHaveBeenCalledOnceWith(countries);
  });

  it('should sort countries alphabetically without mutating the source array or names', () => {
    const italy = country(42, 'Italy');
    const france = country(7, 'France');
    const countries = [italy, france];
    const next = jasmine.createSpy('next');
    service.getCountries().subscribe({ next, error: unexpectedError });
    http.expectOne(url).flush(countries);

    expect(next).toHaveBeenCalledOnceWith([france, italy]);
    expect(countries).toEqual([italy, france]);
    expect(next.calls.mostRecent().args[0]).not.toBe(countries);
    expect(countries.map((item) => item.country)).toEqual(['Italy', 'France']);
  });

  it('should ignore surrounding spaces when sorting and preserve the names', () => {
    const countries = [
      country(1, 'Italy'),
      country(2, '  France  '),
      country(3, ' Argentina'),
    ];
    const next = jasmine.createSpy('next');
    service.getCountries().subscribe({ next, error: unexpectedError });
    http.expectOne(url).flush(countries);
    expect(next).toHaveBeenCalledOnceWith([
      countries[2],
      countries[1],
      countries[0],
    ]);
    expect(countries[1].country).toBe('  France  ');
  });

  it('should sort accented names according to the French locale', () => {
    const countries = [
      country(1, 'Zimbabwe'),
      country(2, 'États-Unis'),
      country(3, 'Allemagne'),
    ];
    const next = jasmine.createSpy('next');
    service.getCountries().subscribe({ next, error: unexpectedError });
    http.expectOne(url).flush(countries);
    expect(next).toHaveBeenCalledOnceWith([
      countries[2],
      countries[1],
      countries[0],
    ]);
  });

  it('should preserve the order of names equivalent in case and accents', () => {
    const countries = [
      country(1, 'équipe'),
      country(2, 'EQUIPE'),
      country(3, 'Equipe'),
    ];
    const next = jasmine.createSpy('next');
    service.getCountries().subscribe({ next, error: unexpectedError });
    http.expectOne(url).flush(countries);
    expect(next).toHaveBeenCalledOnceWith(countries);
  });

  for (const names of [
    ['', 'France', '   ', 'Argentina'],
    ['France', '', 'Argentina', '   '],
  ]) {
    it(`should put empty names last for ${JSON.stringify(names)}`, () => {
      const countries = names.map((name, index) => country(index + 1, name));
      const next = jasmine.createSpy('next');
      service.getCountries().subscribe({ next, error: unexpectedError });
      http.expectOne(url).flush(countries);
      expect(next).toHaveBeenCalledOnceWith([
        countries.find((item) => item.country === 'Argentina'),
        countries.find((item) => item.country === 'France'),
        ...countries.filter((item) => item.country.trim() === ''),
      ]);
    });
  }

  it('should return an empty list and undefined for a lookup in an empty response', () => {
    const list = jasmine.createSpy('list');
    const lookup = jasmine.createSpy('lookup');
    service.getCountries().subscribe({ next: list, error: unexpectedError });
    service
      .getCountryById(42)
      .subscribe({ next: lookup, error: unexpectedError });
    http.expectOne(url).flush([]);
    expect(list).toHaveBeenCalledOnceWith([]);
    expect(lookup).toHaveBeenCalledOnceWith(undefined);
  });

  it('should share one request between simultaneous subscribers', () => {
    const first = jasmine.createSpy('first');
    const second = jasmine.createSpy('second');
    service.getCountries().subscribe({ next: first, error: unexpectedError });
    service.getCountries().subscribe({ next: second, error: unexpectedError });
    const countries = [country(7, 'France')];
    http.expectOne(url).flush(countries);
    expect(first).toHaveBeenCalledOnceWith(countries);
    expect(second).toHaveBeenCalledOnceWith(countries);
  });

  it('should cache a successful response for later subscriptions', () => {
    const first = jasmine.createSpy('first');
    service.getCountries().subscribe({ next: first, error: unexpectedError });
    const countries = [country(7, 'France')];
    http.expectOne(url).flush(countries);
    expect(first).toHaveBeenCalledOnceWith(countries);
    const later = jasmine.createSpy('later');
    service.getCountries().subscribe({ next: later, error: unexpectedError });
    expect(later).toHaveBeenCalledOnceWith(countries);
    http.expectNone(url);
  });

  it('should find a country by ID rather than its position', () => {
    const next = jasmine.createSpy('next');
    service.getCountryById(42).subscribe({ next, error: unexpectedError });
    const italy = country(42, 'Italy');
    http.expectOne(url).flush([italy, country(7, 'France')]);
    expect(next).toHaveBeenCalledOnceWith(italy);
  });

  it('should return undefined for an unknown country ID', () => {
    const next = jasmine.createSpy('next');
    service.getCountryById(99).subscribe({ next, error: unexpectedError });
    http.expectOne(url).flush([country(7, 'France')]);
    expect(next).toHaveBeenCalledOnceWith(undefined);
  });

  it('should share a pending request between list and lookup subscriptions', () => {
    const list = jasmine.createSpy('list');
    const lookup = jasmine.createSpy('lookup');
    service.getCountries().subscribe({ next: list, error: unexpectedError });
    service
      .getCountryById(7)
      .subscribe({ next: lookup, error: unexpectedError });
    const france = country(7, 'France');
    http.expectOne(url).flush([france]);
    expect(list).toHaveBeenCalledOnceWith([france]);
    expect(lookup).toHaveBeenCalledOnceWith(france);
  });

  it('should use the cached list when looking up a country later', () => {
    service.getCountries().subscribe({ error: unexpectedError });
    const france = country(7, 'France');
    http.expectOne(url).flush([france]);
    const lookup = jasmine.createSpy('lookup');
    service
      .getCountryById(7)
      .subscribe({ next: lookup, error: unexpectedError });
    expect(lookup).toHaveBeenCalledOnceWith(france);
    http.expectNone(url);
  });

  it('should propagate an HTTP error to both list and lookup subscribers', () => {
    const listError = jasmine.createSpy('listError');
    const lookupError = jasmine.createSpy('lookupError');
    const next = jasmine.createSpy('next');
    service.getCountries().subscribe({ next, error: listError });
    service.getCountryById(7).subscribe({ next, error: lookupError });
    http
      .expectOne(url)
      .flush('Unavailable', { status: 503, statusText: 'Service Unavailable' });

    expect(next).not.toHaveBeenCalled();
    expect(listError).toHaveBeenCalledTimes(1);
    expect(lookupError).toHaveBeenCalledTimes(1);
    const error: unknown = listError.calls.mostRecent().args[0];
    expect(error instanceof HttpErrorResponse).toBeTrue();
    if (error instanceof HttpErrorResponse) {
      expect(error.status).toBe(503);
      expect(error.error).toBe('Unavailable');
    }
    expect(lookupError.calls.mostRecent().args[0]).toBe(error);
  });

  it('should request data again on a new subscription after an error', () => {
    const error = jasmine.createSpy('error');
    service.getCountries().subscribe({ error });
    http
      .expectOne(url)
      .flush('Unavailable', { status: 503, statusText: 'Service Unavailable' });
    expect(error).toHaveBeenCalledTimes(1);
    const next = jasmine.createSpy('next');
    service.getCountries().subscribe({ next, error: unexpectedError });
    const countries = [country(7, 'France')];
    http.expectOne(url).flush(countries);
    expect(next).toHaveBeenCalledOnceWith(countries);
  });

  it('should keep the request active until all subscribers unsubscribe, then reload on a new subscription', () => {
    const next = jasmine.createSpy('next');
    const first = service
      .getCountries()
      .subscribe({ next, error: unexpectedError });
    const second = service
      .getCountryById(7)
      .subscribe({ next, error: unexpectedError });
    const request = http.expectOne(url);
    first.unsubscribe();
    expect(request.cancelled).toBeFalse();
    second.unsubscribe();
    expect(request.cancelled).toBeTrue();
    expect(next).not.toHaveBeenCalled();

    const later = jasmine.createSpy('later');
    service.getCountries().subscribe({ next: later, error: unexpectedError });
    const countries = [country(7, 'France')];
    http.expectOne(url).flush(countries);
    expect(later).toHaveBeenCalledOnceWith(countries);
  });
});

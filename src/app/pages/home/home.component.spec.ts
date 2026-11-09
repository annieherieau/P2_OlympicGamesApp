import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        {
          provide: DataService,
          useValue: { getCountries: jasmine.createSpy('getCountries').and.returnValue(of([])) }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the empty state when no countries are returned', () => {
    expect(component.state).toBe('empty');
    expect(component.error).toBe('No Olympic data found');
  });

  it('should navigate to the selected country', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    component.onCountryId(1);
    expect(navigate).toHaveBeenCalledWith(['/country', 1]);
  });
});

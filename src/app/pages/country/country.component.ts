import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { asapScheduler, observeOn, of, switchMap } from 'rxjs';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Kpi } from 'src/app/core/models/Kpi';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { CountryDetailComponent } from 'src/app/components/country-detail/country-detail.component';
import { Participation } from 'src/app/core/models/participation.model';
import { PageState } from 'src/app/core/models/page-state';
import { ErrorComponent } from 'src/app/components/error/error.component';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [
    HeaderComponent,
    ButtonComponent,
    CountryDetailComponent,
    ErrorComponent,
    SpinnerComponent,
  ],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements AfterViewInit {
  public titlePage: string = '';
  public data: Participation[] = [];
  public kpiList: Kpi[] = [];
  public error!: string;
  public state: PageState = 'loading';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private destroyRef: DestroyRef,
  ) {}

  ngAfterViewInit(): void {
    this.route.paramMap
      .pipe(
        // Recherche du pays par id
        switchMap((param) => {
          const rawId = param.get('id');
          const countryId = rawId === null ? NaN : Number(rawId);

          // identifiant absent ou invalide.
          if (!Number.isInteger(countryId) || countryId <= 0) {
            return of(undefined);
          }

          return this.dataService.getCountryById(countryId);
        }),

        // Diffère aussi les données en cache après la vérification de la vue.
        observeOn(asapScheduler),
        // Arrête l'abonnement quand on quitte la page
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (country) => {
          // Pays inexistant => Page not found
          if (country === undefined) {
            this.router.navigate(['/not-found', 'Country not found']);
            return;
          }

          this.error = '';
          this.titlePage = country.country;
          this.data = country.participations;

          // données vides
          if (this.data.length === 0) {
            this.state = 'empty';
            return;
          }
          this.buildKpiList();
          this.state = 'success';
        },

        // Une erreur HTTP
        error: (error: HttpErrorResponse) => {
          this.error = error.message;
          this.state = 'error';
        },
      });
  }

  private buildKpiList(): void {
    const totalMedals = this.data.reduce(
      (total, participation) => total + participation.medalsCount,
      0,
    );

    const totalAthletes = this.data.reduce(
      (total, participation) => total + participation.athleteCount,
      0,
    );
    this.kpiList = [
      { label: 'Number of entries', value: this.data.length },
      { label: 'Total Number of medals', value: totalMedals },
      { label: 'Total Number of athletes', value: totalAthletes },
    ];
  }
}

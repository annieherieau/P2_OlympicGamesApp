import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { DataService } from 'src/app/core/services/data.service';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { asapScheduler, observeOn, of, switchMap } from 'rxjs';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Kpi } from 'src/app/core/models/Kpi';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { CountryDetailComponent } from 'src/app/components/country-detail/country-detail.component';
import { Participation } from 'src/app/core/models/participation.model';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [HeaderComponent, ButtonComponent, CountryDetailComponent],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements AfterViewInit {
  public titlePage: string = '';
  private participations: Participation[] = [];
  public kpiList: Kpi[] = [];
  private lineChart!: Chart<'line', number[], number>;
  public chartId: string = 'countryChart';
  public error!: string;

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
          // Supprime les données précédentes (garph / Kpis)
          this.ngOnDestroy();

          // Pays inexistant
          if (country === undefined) {
            this.error = 'Country not found.';
            // Todo trabnsmettre el'erreur
            this.router.navigate(['not-found']);
            return;
          }

          this.error = '';
          this.titlePage = country.country;
          this.participations = country.participations;

          this.buildKpiList();
          this.buildChart();
        },

        // Une erreur HTTP
        // TODO gestion de l'erreur
        error: (error: HttpErrorResponse) => {
          this.error = error.message;
        },
      });
  }

  ngOnDestroy(): void {
    this.lineChart?.destroy();
    this.kpiList = [];
  }

  private buildChart(): void {
    const years = this.participations.map(({ year }) => year);
    const medals = this.participations.map(({ medalsCount }) => medalsCount);

    this.lineChart = new Chart(this.chartId, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'medals',
            data: medals,
            backgroundColor: '#0b868f',
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
  }

  private buildKpiList(): void {
    const totalMedals = this.participations.reduce(
      (total, participation) => total + participation.medalsCount,
      0,
    );

    const totalAthletes = this.participations.reduce(
      (total, participation) => total + participation.athleteCount,
      0,
    );
    this.kpiList = [
      { label: 'Number of entries', value: this.participations.length },
      { label: 'Total Number of medals', value: totalMedals },
      { label: 'Total Number of athletes', value: totalAthletes },
    ];
  }
}

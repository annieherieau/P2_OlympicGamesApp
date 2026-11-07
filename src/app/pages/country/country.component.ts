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
  public lineChart!: Chart<'line', string[], number>;
  public titlePage: string = '';
  public chartId: string = 'countryChart';
  public kpiList: Kpi[] = [];
  public totalEntries: any = 0;
  public totalMedals: number = 0;
  public totalAthletes: number = 0;
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
          // Supprime le graphique précédent avant d'afficher un autre pays.
          this.lineChart?.destroy();

          if (country === undefined) {
            this.router.navigate(['not-found']);
            return;
          }

          this.titlePage = country ? country.country : '';
          const participations = country?.participations.map((i: any) => i);
          this.totalEntries = participations?.length ?? 0;
          const years = participations?.map((i: any) => i.year) ?? [];
          const medals =
            participations?.map((i: any) => i.medalsCount.toString()) ??
            [];
          this.totalMedals = medals.reduce(
            (accumulator: any, item: any) => accumulator + parseInt(item),
            0,
          );
          const nbAthletes =
            participations?.map((i: any) =>
              i.athleteCount.toString(),
            ) ?? [];
          this.totalAthletes = nbAthletes.reduce(
            (accumulator: any, item: any) => accumulator + parseInt(item),
            0,
          );
          this.buildKpiList(participations);
          this.buildChart(years, medals);
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
  }

  buildChart(years: number[], medals: string[]) {
    const lineChart = new Chart(this.chartId, {
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
    this.lineChart = lineChart;
  }

  buildKpiList(participations: Participation[]): void {
    this.kpiList.push({ label: 'Number of entries', value: this.totalEntries });
    this.kpiList.push({ label: 'Total Number of medals', value: this.totalMedals });
    this.kpiList.push({ label: 'Total Number of athletes', value: this.totalAthletes });
  }
}

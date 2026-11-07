import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { DataService } from 'src/app/core/services/data.service';
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements OnInit {
  public lineChart!: Chart<'line', string[], number>;
  public titlePage: string = '';
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

  ngOnInit(): void {
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

        // Arrête l'abonnement quand on quitte la page
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (country) => {
          // Supprime le graphique précédent avant d'afficher un autre pays.
          this.ngOnDestroy();

          if (country === undefined) {
            this.router.navigate(['not-found']);
          }

          this.titlePage = country ? country.country : '';
          const participations = country?.participations.map((i: any) => i);
          this.totalEntries = participations?.length ?? 0;
          const years = country?.participations.map((i: any) => i.year) ?? [];
          const medals =
            country?.participations.map((i: any) => i.medalsCount.toString()) ??
            [];
          this.totalMedals = medals.reduce(
            (accumulator: any, item: any) => accumulator + parseInt(item),
            0,
          );
          const nbAthletes =
            country?.participations.map((i: any) =>
              i.athleteCount.toString(),
            ) ?? [];
          this.totalAthletes = nbAthletes.reduce(
            (accumulator: any, item: any) => accumulator + parseInt(item),
            0,
          );

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
    const lineChart = new Chart('countryChart', {
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
}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { DataService } from 'src/app/core/services/data.service';
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type ChartData = {
  ids: number[];
  labels: string[];
  sumOfAllMedalsYears: number[];
};
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public pieChart!: Chart<'pie', number[], string>;
  public totalCountries: number = 0;
  public totalJOs: number = 0;
  public error!: string;
  titlePage: string = 'Medals per Country';

  constructor(
    private router: Router,
    private service: DataService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.service
      .getCountries()
      .pipe(
        // Arrête l'abonnement quand on quitte la page
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          // Supprime le graphique précédent
          this.ngOnDestroy();
          console.log('Liste des données :', data);
          if (data.length > 0) {
            this.totalJOs = Array.from(
              new Set(
                data
                  .map((i: any) => i.participations.map((f: any) => f.year))
                  .flat(),
              ),
            ).length;
            const countries: string[] = data.map((i: any) => i.country);
            const ids: number[] = data.map((i: any) => i.id);
            this.totalCountries = countries.length;
            const medals = data.map((i: any) =>
              i.participations.map((i: any) => i.medalsCount),
            );
            const sumOfAllMedalsYears = medals.map((i) =>
              i.reduce((acc: any, i: any) => acc + i, 0),
            );
            const chartData = {
              ids: ids,
              labels: countries,
              sumOfAllMedalsYears: sumOfAllMedalsYears,
            };
            this.buildPieChart(chartData);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.error = error.message;
        },
      });
  }

  ngOnDestroy(): void {
    this.pieChart?.destroy();
  }

  buildPieChart(data: ChartData) {
    const ids = data.ids;
    const pieChart = new Chart('DashboardPieChart', {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Medals',
            data: data.sumOfAllMedalsYears,
            backgroundColor: [
              '#0b868f',
              '#adc3de',
              '#7a3c53',
              '#8f6263',
              'orange',
              '#94819d',
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
        onClick: (e) => {
          if (e.native) {
            const points = pieChart.getElementsAtEventForMode(
              e.native,
              'point',
              { intersect: true },
              true,
            );
            if (points.length) {
              const firstPoint = points[0];
              const id = ids ? ids[firstPoint.index] : '';

              this.router.navigate(['country', id]);
            }
          }
        },
      },
    });
    this.pieChart = pieChart;
  }
}

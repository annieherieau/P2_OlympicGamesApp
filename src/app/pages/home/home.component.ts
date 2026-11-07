import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { DataService } from 'src/app/core/services/data.service';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DashboardComponent } from 'src/app/components/dashboard/dashboard.component';
import { Kpi } from 'src/app/core/models/Kpi';
import { Olympic } from 'src/app/core/models/olympic.model';
import { asapScheduler, observeOn } from 'rxjs';

type ChartData = {
  ids: number[];
  labels: string[];
  sumOfAllMedalsYears: number[];
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, DashboardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  public pieChart!: Chart<'pie', number[], string>;
  public chartId: string = 'DashboardPieChart';
  public kpiList: Kpi[] = [];
  public countries: string[] = []
  public totalCountries: number = 0;
  public label1 = 'Number of countries';
  public totalJOs: number = 0;
  public error!: string;
  titlePage: string = 'Medals per Country';

  constructor(
    private router: Router,
    private service: DataService,
    private destroyRef: DestroyRef,
  ) {}

  ngAfterViewInit(): void {
    this.service
      .getCountries()
      .pipe(
        // Diffère aussi les données en cache après la vérification de la vue.
        observeOn(asapScheduler),
        // Arrête l'abonnement quand on quitte la page
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          // Supprime le graphique précédent
          this.pieChart?.destroy();
          
          if (data.length > 0) {
            
            const countries: string[] = data.map((i: any) => i.country);
            const ids: number[] = data.map((i: any) => i.id);

            this.buildKpiList(data);

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
    const pieChart = new Chart(this.chartId, {
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

  buildKpiList(data: Olympic[]): void {
    const countries: string[] = data.map((i: any) => i.country);
    // KPIs
    this.totalJOs = Array.from(
      new Set(
        data.map((i: any) => i.participations.map((f: any) => f.year)).flat(),
      ),
    ).length;
    this.totalCountries = countries.length;

    this.kpiList.push({
      label: 'Number of countries',
      value: this.totalCountries,
    });
    this.kpiList.push({ label: 'Number of JOs', value: this.totalJOs });
  }
}

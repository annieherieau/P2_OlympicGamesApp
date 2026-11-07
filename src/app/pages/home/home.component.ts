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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, DashboardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  public titlePage: string = 'Medals per Country';
  private pieChart!: Chart<'pie', number[], string>;
  public chartId: string = 'DashboardPieChart';
  public kpiList: Kpi[] = [];
  private data: Olympic[] = [];
  public error!: string;

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
          // Supprime les données précédentes (garph / Kpis)
          this.ngOnDestroy();

          if (data.length > 0) {
            this.error = '';
            this.data = data;

            this.buildKpiList();
            this.buildPieChart();
          } else {
            // TODO l'afficher quelque part
            this.error = 'No olympic data';
          }
        },
        error: (error: HttpErrorResponse) => {
          this.error = error.message;
        },
      });
  }

  ngOnDestroy(): void {
    this.pieChart?.destroy();
    this.data = [];
  }

  private buildPieChart() : void{
    const labels = this.data.map((country) => country.country);
    const sumOfAllMedalsYears = this.data.map((country) =>
      country.participations.reduce(
        (total, participation) => total + participation.medalsCount,
        0,
      ),
    );

    const ids = this.data.map((country) => country.id);

    this.pieChart = new Chart(this.chartId, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Medals',
            data: sumOfAllMedalsYears,
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
            const points = this.pieChart.getElementsAtEventForMode(
              e.native,
              'point',
              { intersect: true },
              true,
            );
            if (points.length) {
              const firstPoint = points[0];
              const id = ids[firstPoint.index];

              this.router.navigate(['country', id]);
            }
          }
        },
      },
    });
  }

  private buildKpiList(): void {
    const years = this.data.flatMap((country) =>
      country.participations.map((participation) => participation.year),
    );
    this.kpiList = [
      { label: 'Number of countries', value: this.data.length },
      { label: 'Number of JOs', value: new Set(years).size },
    ];
  }
}

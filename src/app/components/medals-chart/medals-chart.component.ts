import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { Olympic } from 'src/app/core/models/olympic.model';
import Chart from 'chart.js/auto';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-medals-chart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './medals-chart.component.html',
  styleUrl: './medals-chart.component.scss',
})
export class MedalsChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() data: Olympic[] = [];
  medalRows: { id: number; country: string; total: number }[] = [];

  private static nextDescriptionId = 0;
  readonly descriptionId = `medals-description-${MedalsChartComponent.nextDescriptionId++}`;
  // Transmet l'id du pays cliqué
  // Transmet le pays cliqué à la page Home.
  @Output() countryId = new EventEmitter<number>();

  // Récupère le canvas et sera transmis à Chart.js.
  @ViewChild('canvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;

  // le graphique
  private pieChart?: Chart<'pie', number[], string>;

  // Empêche la création du graphique tant que le canvas n'est pas disponible.
  private viewReady = false;

  // initialisation de la vue
  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
  }

  // refait le graphique si changement dans les données
  ngOnChanges(): void {
    this.medalRows = this.data.map(({ id, country, participations }) => ({
      id,
      country,
      total: participations.reduce(
        (total, participation) => total + participation.medalsCount,
        0,
      ),
    }));
    this.renderChart();
  }

  private renderChart(): void {
    // pas d'affichage avant initialisation
    if (!this.viewReady) return;

    // Supprime l'ancien graphique
    this.pieChart?.destroy();
    this.pieChart = undefined;

    // Attend des données avant de construire le camembert.
    if (this.data.length === 0) return;

    this.buildChart();
  }

  // Supprime le graphique quand le composant est détruit.
  ngOnDestroy(): void {
    this.viewReady = false;
    this.pieChart?.destroy();
    this.pieChart = undefined;
  }

  private buildChart(): void {
    const ids: number[] = this.data.map((country) => country.id);
    const labels: string[] = this.data.map((country) => country.country);
    const sumOfAllMedalsYears = this.medalRows.map(({ total }) => total);
    // canvas local
    this.pieChart = new Chart(this.canvasRef.nativeElement, {
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
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Total Olympic medals by country',
            color: '#595959',
            position: 'bottom',
            font: {
              size: 18,
            },
          },
        },
        onClick: (e) => {
          if (e.native && this.pieChart) {
            // Recherche le secteur situé sous le clic.
            const points = this.pieChart.getElementsAtEventForMode(
              e.native,
              'point',
              { intersect: true },
              true,
            );
            if (points.length) {
              const firstPoint = points[0];
              const id = ids[firstPoint.index];

              this.countryId.emit(id);
            }
          }
        },
      },
    });
  }
}

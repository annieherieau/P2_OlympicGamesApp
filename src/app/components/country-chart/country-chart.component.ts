import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import Chart from 'chart.js/auto';
import { Participation } from 'src/app/core/models/participation.model';

@Component({
  selector: 'app-country-chart',
  standalone: true,
  imports: [],
  templateUrl: './country-chart.component.html',
  styleUrl: './country-chart.component.scss',
})
export class CountryChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() data: Participation[] = [];
  // Récupère le canvas et sera transmis à Chart.js.
  @ViewChild('canvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;
  private lineChart!: Chart<'line', number[], number>;

  // Empêche la création du graphique tant que le canvas n'est pas disponible.
  private viewReady = false;

  // initialisation de la vue
  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
  }

  // refait le graphique si changement dans les données
  ngOnChanges(): void {
    this.renderChart();
  }
  
  // Supprime le graphique quand le composant est détruit.
  ngOnDestroy(): void {
    this.viewReady = false;
    this.lineChart?.destroy();
  }

  private renderChart(): void {
    // pas d'affichage avant initialisation
    if (!this.viewReady) return;

    // Supprime l'ancien graphique
    this.lineChart?.destroy();

    // Attend des données avant de construire le camembert.
    if (this.data.length === 0) return;

    this.buildChart();
  }

  private buildChart(): void {
    const years: number[] = this.data.map(({ year }) => year);
    const medals: number[] = this.data.map(({ medalsCount }) => medalsCount);

    this.lineChart = new Chart(this.canvasRef.nativeElement, {
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
}

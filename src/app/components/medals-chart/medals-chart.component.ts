import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-medals-chart',
  standalone: true,
  imports: [],
  templateUrl: './medals-chart.component.html',
  styleUrl: './medals-chart.component.scss',
})
export class MedalsChartComponent {
  @Input() chartId: string = '';
}

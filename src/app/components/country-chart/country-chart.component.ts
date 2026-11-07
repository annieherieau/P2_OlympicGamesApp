import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-country-chart',
  standalone: true,
  imports: [],
  templateUrl: './country-chart.component.html',
  styleUrl: './country-chart.component.scss',
})
export class CountryChartComponent {
  @Input() chartId: string = '';
}

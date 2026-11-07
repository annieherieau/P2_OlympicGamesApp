import { Component, Input} from '@angular/core';
import { KpiListComponent } from '../kpi-list/kpi-list.component';
import { CountryChartComponent } from '../country-chart/country-chart.component';
import { Kpi } from 'src/app/core/models/Kpi';

@Component({
  selector: 'app-country-detail',
  standalone: true,
  imports: [KpiListComponent, CountryChartComponent],
  templateUrl: './country-detail.component.html',
  styleUrl: './country-detail.component.scss'
})
export class CountryDetailComponent {
  @Input() kpiList: Kpi[] = [];
  @Input() chartId: string = '';
}

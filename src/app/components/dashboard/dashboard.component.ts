import { Component, Input } from '@angular/core';
import { KpiListComponent } from '../kpi-list/kpi-list.component';
import { Kpi } from 'src/app/core/models/Kpi';
import { MedalsChartComponent } from '../medals-chart/medals-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [KpiListComponent, MedalsChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  @Input() kpiList: Kpi[] = [];
  @Input() chartId: string = '';
}

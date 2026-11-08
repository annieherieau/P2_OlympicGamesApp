import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KpiListComponent } from '../kpi-list/kpi-list.component';
import { Kpi } from 'src/app/core/models/Kpi';
import { MedalsChartComponent } from '../medals-chart/medals-chart.component';
import { Olympic } from 'src/app/core/models/olympic.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [KpiListComponent, MedalsChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  @Input() kpiList: Kpi[] = [];
  //@Input() chartId: string = '';
  @Input() data: Olympic[] = []
  // Transmet le pays cliqué à la page Home.
  @Output() countryId = new EventEmitter<number>();
}

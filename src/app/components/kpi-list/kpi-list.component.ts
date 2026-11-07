import { Component, Input } from '@angular/core';
import { Kpi } from 'src/app/core/models/Kpi';
import { KpiComponent } from '../kpi/kpi.component';

@Component({
  selector: 'app-kpi-list',
  standalone: true,
  imports: [KpiComponent],
  templateUrl: './kpi-list.component.html',
  styleUrl: './kpi-list.component.scss'
})
export class KpiListComponent {
  @Input() kpiList: Kpi[] = []
}

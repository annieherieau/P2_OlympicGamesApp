import { Component, Input } from '@angular/core';
import { Kpi } from 'src/app/core/models/Kpi';
import { KpiListComponent } from '../kpi-list/kpi-list.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [KpiListComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() titlePage: string = '';
  @Input() kpiList: Kpi[] = [];
}

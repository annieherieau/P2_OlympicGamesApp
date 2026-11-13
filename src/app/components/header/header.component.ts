import { Component, Input, input } from '@angular/core';
import { Kpi } from 'src/app/core/models/Kpi';
import { KpiListComponent } from '../kpi-list/kpi-list.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [KpiListComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input() titlePage: string = '';
  @Input() kpiList: Kpi[] = [];
  homelink: string = '/';
  readonly isHome = input(false);
}

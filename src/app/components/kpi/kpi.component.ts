import { Component, Input } from '@angular/core';
import { Kpi } from 'src/app/core/models/Kpi.model';

@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.scss',
})
export class KpiComponent {
  @Input() kpi: Kpi = {
    label: '',
    value: 0,
  };
}

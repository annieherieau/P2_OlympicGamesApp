import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DashboardComponent } from 'src/app/components/dashboard/dashboard.component';
import { Kpi } from 'src/app/core/models/Kpi';
import { Olympic } from 'src/app/core/models/olympic.model';
import { asapScheduler, observeOn } from 'rxjs';
import { PageState } from 'src/app/core/models/page-state';
import { ErrorComponent } from 'src/app/components/error/error.component';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    DashboardComponent,
    ErrorComponent,
    SpinnerComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  public titlePage: string = 'Medals per Country';
  public kpiList: Kpi[] = [];
  public data: Olympic[] = [];
  public error!: string;
  public state: PageState = 'loading';

  constructor(
    private router: Router,
    private service: DataService,
    private destroyRef: DestroyRef,
  ) {}

  ngAfterViewInit(): void {
    this.service
      .getCountries()
      .pipe(
        // Diffère aussi les données en cache après la vérification de la vue.
        observeOn(asapScheduler),
        // Arrête l'abonnement quand on quitte la page
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          if (data.length === 0) {
            this.state = 'empty';
            this.error = 'No Olympic data found';
            return;
          }
          this.error = '';
          this.data = data;
          this.buildKpiList();
          this.state = 'success';
        },
        error: (error: HttpErrorResponse) => {
          this.error = error.message;
          this.state = 'error';
        },
      });
  }

  // Ouvre la page du pays sélectionné dans le graphique.
  onCountryId(id: number): void {
    this.router.navigate(['/country', id]);
  }

  private buildKpiList(): void {
    const years = this.data.flatMap((country) =>
      country.participations.map((participation) => participation.year),
    );
    this.kpiList = [
      { label: 'Number of countries', value: this.data.length },
      { label: 'Number of JOs', value: new Set(years).size },
    ];
  }
}

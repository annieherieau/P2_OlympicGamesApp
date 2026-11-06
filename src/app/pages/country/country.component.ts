import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements OnInit {
  public lineChart!: Chart<'line', string[], number>;
  public titlePage: string = '';
  public totalEntries: any = 0;
  public totalMedals: number = 0;
  public totalAthletes: number = 0;
  public error!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
  ) {}

  ngOnInit() : void {
    let countryId = 0;
    this.route.paramMap.subscribe(
      (param: ParamMap) => (countryId = Number(param.get('countryName'))),
    );
    this.dataService
      .getCountryById(countryId)
      .pipe()
      .subscribe({
        next: (data) => {
          console.log(data);

          if (data !== undefined) {
            const selectedCountry = data;
            this.titlePage = selectedCountry.country;
            const participations = selectedCountry?.participations.map(
              (i: any) => i,
            );
            this.totalEntries = participations?.length ?? 0;
            const years =
              selectedCountry?.participations.map((i: any) => i.year) ?? [];
            const medals =
              selectedCountry?.participations.map((i: any) =>
                i.medalsCount.toString(),
              ) ?? [];
            this.totalMedals = medals.reduce(
              (accumulator: any, item: any) => accumulator + parseInt(item),
              0,
            );
            const nbAthletes =
              selectedCountry?.participations.map((i: any) =>
                i.athleteCount.toString(),
              ) ?? [];
            this.totalAthletes = nbAthletes.reduce(
              (accumulator: any, item: any) => accumulator + parseInt(item),
              0,
            );
            this.buildChart(years, medals);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.error = error.message;
        },
      });
  }

  buildChart(years: number[], medals: string[]) {
    const lineChart = new Chart('countryChart', {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'medals',
            data: medals,
            backgroundColor: '#0b868f',
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
    this.lineChart = lineChart;
  }
}

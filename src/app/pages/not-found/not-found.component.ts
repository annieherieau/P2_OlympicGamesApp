import { Component } from '@angular/core';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [HeaderComponent, ButtonComponent],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent {
  titlePage: string = 'Page not Found';
  error!: string;

  constructor(private route: ActivatedRoute) {
    this.error =
      this.route.snapshot.paramMap.get('error') ??
      'No corresponding page found';
  }
}

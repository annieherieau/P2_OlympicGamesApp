import { Component } from '@angular/core';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ButtonComponent } from 'src/app/components/button/button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [HeaderComponent, ButtonComponent],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent {
  titlePage: string = 'Page not Found';
  constructor() {}
}

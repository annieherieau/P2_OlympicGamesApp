import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedalsChartComponent } from './medals-chart.component';

describe('MedalsChartComponent', () => {
  let component: MedalsChartComponent;
  let fixture: ComponentFixture<MedalsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedalsChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedalsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

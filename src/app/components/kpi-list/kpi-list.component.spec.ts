import { By } from '@angular/platform-browser';
import { KpiComponent } from '../kpi/kpi.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiListComponent } from './kpi-list.component';

describe('KpiListComponent', () => {
  let component: KpiListComponent;
  let fixture: ComponentFixture<KpiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function children(): KpiComponent[] {
    return fixture.debugElement.queryAll(By.directive(KpiComponent))
      .map((child) => child.componentInstance as KpiComponent);
  }

  it('should create one child per KPI and pass inputs in order', () => {
    const kpis = [
      { label: 'Medals', value: 8 },
      { label: 'Athletes', value: 30 },
    ];
    fixture.componentRef.setInput('kpiList', kpis);
    fixture.detectChanges();
    expect(children().map((child) => child.kpi)).toEqual(kpis);
  });

  it('should not display any KPI for an empty list', () => {
    fixture.componentRef.setInput('kpiList', []);
    fixture.detectChanges();
    expect(children()).toEqual([]);
  });

  it('should update the children when the list is replaced, including with an empty list', () => {
    fixture.componentRef.setInput('kpiList', [
      { label: 'Medals', value: 8 },
      { label: 'Athletes', value: 30 },
    ]);
    fixture.detectChanges();
    expect(children().length).toBe(2);
    const replacement = [{ label: 'Countries', value: 5 }];
    fixture.componentRef.setInput('kpiList', replacement);
    fixture.detectChanges();
    expect(children().map((child) => child.kpi)).toEqual(replacement);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Countries');
    expect(element.textContent).not.toContain('Athletes');
    fixture.componentRef.setInput('kpiList', []);
    fixture.detectChanges();
    expect(children()).toEqual([]);
  });
});

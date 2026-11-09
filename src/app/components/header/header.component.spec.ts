import { By } from '@angular/platform-browser';
import { KpiListComponent } from '../kpi-list/kpi-list.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function kpiList(): KpiListComponent {
    return fixture.debugElement.query(By.directive(KpiListComponent))
      .componentInstance as KpiListComponent;
  }

  it('should display the application and page titles', () => {
    fixture.componentRef.setInput('titlePage', 'France');
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Olympic games app');
    expect(element.querySelector('h2')?.textContent?.trim()).toBe('France');
  });

  it('should pass KPIs to the list', () => {
    const kpis = [{ label: 'Medals', value: 8 }];
    fixture.componentRef.setInput('kpiList', kpis);
    fixture.detectChanges();
    expect(kpiList().kpiList).toEqual(kpis);
  });

  it('should update the title and KPIs when inputs change', () => {
    fixture.componentRef.setInput('titlePage', 'France');
    fixture.componentRef.setInput('kpiList', [{ label: 'Medals', value: 8 }]);
    fixture.detectChanges();
    const kpis = [{ label: 'Athletes', value: 30 }];
    fixture.componentRef.setInput('titlePage', 'Italy');
    fixture.componentRef.setInput('kpiList', kpis);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h2')?.textContent?.trim()).toBe('Italy');
    expect(kpiList().kpiList).toEqual(kpis);
    expect(element.textContent).toContain('Athletes');
    expect(element.textContent).not.toContain('Medals');
  });
});

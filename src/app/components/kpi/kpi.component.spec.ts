import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiComponent } from './kpi.component';

describe('KpiComponent', () => {
  let component: KpiComponent;
  let fixture: ComponentFixture<KpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function texts(): (string | null)[] {
    const element: HTMLElement = fixture.nativeElement;
    return Array.from(element.querySelectorAll('p'), (node) => node.textContent?.trim() ?? null);
  }

  it('should display the KPI label and value', () => {
    fixture.componentRef.setInput('kpi', { label: 'Total medals', value: 8 });
    fixture.detectChanges();
    expect(texts()).toEqual(['Total medals', '8']);
  });

  it('should display a zero value', () => {
    fixture.componentRef.setInput('kpi', { label: 'Total medals', value: 0 });
    fixture.detectChanges();
    expect(texts()).toEqual(['Total medals', '0']);
  });

  it('should update the label and value when the input changes', () => {
    fixture.componentRef.setInput('kpi', { label: 'Medals', value: 8 });
    fixture.detectChanges();
    expect(texts()).toEqual(['Medals', '8']);
    fixture.componentRef.setInput('kpi', { label: 'Athletes', value: 30 });
    fixture.detectChanges();
    expect(texts()).toEqual(['Athletes', '30']);
  });
});

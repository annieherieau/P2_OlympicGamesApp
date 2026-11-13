import { ComponentFixture, TestBed } from '@angular/core/testing';
import Chart from 'chart.js/auto';
import { Participation } from 'src/app/core/models/participation.model';
import { CountryChartComponent } from './country-chart.component';

describe('CountryChartComponent', () => {
  let fixture: ComponentFixture<CountryChartComponent>;
  let getContext: jasmine.Spy;
  let originalAnimation: typeof Chart.defaults.animation;
  const data: Participation[] = [
    { id: 1, year: 2016, city: 'Rio', medalsCount: 3, athleteCount: 10 },
    { id: 2, year: 2012, city: 'London', medalsCount: 5, athleteCount: 20 },
  ];

  beforeEach(async () => {
    // Garde un vrai canvas et évite les animations asynchrones pendant les tests.
    getContext = spyOn(
      HTMLCanvasElement.prototype,
      'getContext',
    ).and.callThrough();
    originalAnimation = Chart.defaults.animation;
    Chart.defaults.animation = false;
    await TestBed.configureTestingModule({
      imports: [CountryChartComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CountryChartComponent);
  });

  afterEach(() => {
    try {
      fixture.destroy();
    } finally {
      Chart.getChart(canvas())?.destroy();
      Chart.defaults.animation = originalAnimation;
    }
  });

  function canvas(): HTMLCanvasElement {
    const element: HTMLElement = fixture.nativeElement;
    return element.querySelector('canvas')!;
  }

  function chart(): Chart<'line', number[], number> {
    const instance = Chart.getChart(canvas());
    expect(instance).toBeDefined();
    return instance as Chart<'line', number[], number>;
  }

  function render(value: Participation[] = data): void {
    fixture.componentRef.setInput('data', value);
    fixture.detectChanges();
  }

  it('should create', () => {
    render([]);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not create a chart before the view is ready', () => {
    fixture.componentRef.setInput('data', data);
    fixture.componentInstance.ngOnChanges();
    expect(getContext).not.toHaveBeenCalled();
    fixture.detectChanges();
    expect(chart().canvas).toBe(canvas());
  });

  it('should not create a chart with empty data once the view is ready', () => {
    render([]);
    render([]);
    expect(getContext).not.toHaveBeenCalled();
    expect(Chart.getChart(canvas())).toBeUndefined();
  });

  it('should allow destruction without a chart', () => {
    render([]);
    expect(() => fixture.destroy()).not.toThrow();
    expect(getContext).not.toHaveBeenCalled();
  });

  it('should build a line chart with the expected labels and medal values', () => {
    render();
    const instance = chart();
    expect('type' in instance.config ? instance.config.type : undefined).toBe(
      'line',
    );
    expect(instance.data.labels).toEqual([2016, 2012]);
    expect(instance.data.datasets[0].data).toEqual([3, 5]);
  });

  it('should destroy the old chart and rebuild it when data changes', () => {
    render();
    const previous = chart();
    const destroy = spyOn(previous, 'destroy').and.callThrough();
    render([{ ...data[0], year: 2024, medalsCount: 12 }]);
    const current = chart();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(current).not.toBe(previous);
    expect(current.data.labels).toEqual([2024]);
    expect(current.data.datasets[0].data).toEqual([12]);
  });

  it('should remove the chart without rebuilding it when data becomes empty', () => {
    render();
    const destroy = spyOn(chart(), 'destroy').and.callThrough();
    getContext.calls.reset();
    render([]);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(Chart.getChart(canvas())).toBeUndefined();
    expect(getContext).not.toHaveBeenCalled();
  });

  it('should destroy the active chart when the component is destroyed', () => {
    render();
    const destroy = spyOn(chart(), 'destroy').and.callThrough();
    fixture.destroy();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(Chart.getChart(canvas())).toBeUndefined();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import Chart from 'chart.js/auto';
import { Olympic } from 'src/app/core/models/olympic.model';
import { MedalsChartComponent } from './medals-chart.component';
import { provideRouter } from '@angular/router';

describe('MedalsChartComponent', () => {
  let fixture: ComponentFixture<MedalsChartComponent>;
  let getContext: jasmine.Spy;
  let originalAnimation: typeof Chart.defaults.animation;
  const data: Olympic[] = [
    {
      id: 7,
      country: 'France',
      participations: [
        { id: 1, year: 2016, city: 'Rio', medalsCount: 3, athleteCount: 10 },
        { id: 2, year: 2012, city: 'London', medalsCount: 5, athleteCount: 20 },
      ],
    },
    { id: 42, country: 'Italy', participations: [] },
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
      imports: [MedalsChartComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(MedalsChartComponent);
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

  function chart(): Chart<'pie', number[], string> {
    const instance = Chart.getChart(canvas());
    expect(instance).toBeDefined();
    return instance as Chart<'pie', number[], string>;
  }

  function render(value: Olympic[] = data): void {
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

  it('should build a pie chart with the expected labels and medal values', () => {
    render();
    const instance = chart();
    expect('type' in instance.config ? instance.config.type : undefined).toBe(
      'pie',
    );
    expect(instance.data.labels).toEqual(['France', 'Italy']);
    expect(instance.data.datasets[0].data).toEqual([8, 0]);
  });

  it('should destroy the old chart and rebuild it when data changes', () => {
    render();
    const previous = chart();
    const destroy = spyOn(previous, 'destroy').and.callThrough();
    render([{ ...data[0], id: 99, country: 'Japan' }]);
    const current = chart();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(current).not.toBe(previous);
    expect(current.data.labels).toEqual(['Japan']);
    expect(current.data.datasets[0].data).toEqual([8]);
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

  function click(
    instance: Chart<'pie', number[], string>,
    native: MouseEvent | null,
  ): void {
    const onClick = instance.options.onClick;
    expect(onClick).toBeDefined();
    if (!onClick) throw new Error('Missing chart click callback');
    onClick.call(instance, { type: 'click', native, x: 0, y: 0 }, [], instance);
  }

  it('should emit the country ID rather than its sector index', () => {
    render();
    const instance = chart();
    const hitTest = spyOn(
      instance,
      'getElementsAtEventForMode',
    ).and.returnValue([
      {
        index: 1,
        datasetIndex: 0,
        element: instance.getDatasetMeta(0).data[1],
      },
    ]);
    const emit = spyOn(fixture.componentInstance.countryId, 'emit');
    const native = new MouseEvent('click');
    click(instance, native);
    expect(hitTest).toHaveBeenCalledOnceWith(
      native,
      'point',
      { intersect: true },
      true,
    );
    expect(emit).toHaveBeenCalledOnceWith(42);
  });

  it('should not emit when clicking outside a sector', () => {
    render();
    const instance = chart();
    const hitTest = spyOn(
      instance,
      'getElementsAtEventForMode',
    ).and.returnValue([]);
    const emit = spyOn(fixture.componentInstance.countryId, 'emit');
    click(instance, new MouseEvent('click'));
    expect(hitTest).toHaveBeenCalledTimes(1);
    expect(emit).not.toHaveBeenCalled();
  });

  it('should ignore a click without a native event', () => {
    render();
    const instance = chart();
    const hitTest = spyOn(instance, 'getElementsAtEventForMode');
    const emit = spyOn(fixture.componentInstance.countryId, 'emit');
    click(instance, null);
    expect(hitTest).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('should use updated country IDs after data replacement', () => {
    render();
    render([{ ...data[0], id: 99, country: 'Japan' }]);
    const instance = chart();
    spyOn(instance, 'getElementsAtEventForMode').and.returnValue([
      {
        index: 0,
        datasetIndex: 0,
        element: instance.getDatasetMeta(0).data[0],
      },
    ]);
    const emit = spyOn(fixture.componentInstance.countryId, 'emit');
    click(instance, new MouseEvent('click'));
    expect(emit).toHaveBeenCalledOnceWith(99);
  });
});

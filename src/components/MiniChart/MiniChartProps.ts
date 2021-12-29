import {ChartScale} from './chart-scale';
import {MiniChartDataAccessors} from './mini-chart-data-accessors';

export interface MiniChartProps<T extends R, R> {
  seriesOrder: Array<string>;
  diffValue?: string;
  isActive: boolean;
  aggregateValues: R;
  title: string,
  width: number,
  height: number,
  data: Array<T>,
  units?: string,
  xAccessor: (d: T) => number | Date,
  yAccessors: MiniChartDataAccessors<T>,
  seriesColors: { [seriesKey: string]: string },
  seriesLabelColors: { [seriesKey: string]: string },
  yScaleCreate: (props: MiniChartProps<T, R>, chartHeight: number) => ChartScale,
  xScaleCreate: (props: MiniChartProps<T, R>) => ChartScale,
}

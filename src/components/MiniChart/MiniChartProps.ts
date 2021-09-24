import {ChartScale} from './chart-scale';
import {MiniChartDataAccessors} from './mini-chart-data-accessors';

export interface MiniChartProps<T> {
  seriesOrder: Array<string>;
  diffValue: string;
  isActive: boolean;
  aggregateValues: { [seriesKey: string]: number };
  title: string,
  width: number,
  height: number,
  data: Array<T>,
  xAccessor: (d: T) => number | Date,
  yAccessors: MiniChartDataAccessors<T>,
  seriesColors: { [seriesKey: string]: string },
  seriesLabelColors: { [seriesKey: string]: string },
  yScaleCreate: (props: MiniChartProps<T>, chartHeight: number) => ChartScale,
  xScaleCreate: (props: MiniChartProps<T>) => ChartScale,
}

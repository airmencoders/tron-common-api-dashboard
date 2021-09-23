import {ChartScale} from './chart-scale';
import {MiniChartDataAccessors} from './mini-chart-data-accessors';

export interface MiniChartProps {
  seriesOrder: Array<string>;
  diffValue: string;
  isActive: boolean;
  aggregateValues: { [seriesKey: string]: number };
  title: string,
  width: number,
  height: number,
  data: Array<any>,
  xAccessor: (d: any) => any,
  yAccessors: MiniChartDataAccessors,
  seriesColors: { [seriesKey: string]: string },
  seriesLabelColors: { [seriesKey: string]: string },
  yScaleCreate: (props: MiniChartProps, chartHeight: number) => ChartScale,
  xScaleCreate: (props: MiniChartProps) => ChartScale,
}

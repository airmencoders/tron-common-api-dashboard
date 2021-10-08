import { ApexOptions } from 'apexcharts';
import { ChartSeries } from './ChartSeries';

export interface ChartWithTitleAndTotalProps {
  series: ChartSeries;
  total: number;
  title: string;
  options?: ApexOptions;
  calculateAverage?: boolean;
  hideTotal?: boolean;
}

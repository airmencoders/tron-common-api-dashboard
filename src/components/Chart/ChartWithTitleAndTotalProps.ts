import { ApexOptions } from 'apexcharts';
import { ChartSeries } from './ChartSeries';

export interface ChartWithTitleAndTotalProps {
  series: ChartSeries;
  total: number;
  title: string;
  options?: ApexOptions;
  labels?: string[];
  calculateAverage?: boolean;
  hideTotal?: boolean;
}

import { ApexOptions } from 'apexcharts';
import { ChartSeries } from './ChartSeries';

export interface ChartWithTitleAndTotalProps {
  series: ChartSeries;
  title: string;
  options?: ApexOptions;
  labels: string[];
  calculateAverage?: boolean;
  hideTotal?: boolean;
}
import KpiMiniData from './kpi-mini-data';
import KpiMiniDataValues from './kpi-mini-data-values';

export interface KpiMiniChartProps {
  data: Array<KpiMiniData>;
  aggregateValues: KpiMiniDataValues;
  isActive: boolean;
  title: string;
  onSelected: (kpiTitle: string) => void;
}

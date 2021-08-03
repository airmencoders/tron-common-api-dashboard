import { KpiType } from './kpi-type';

export interface KpiDatePickerProps {
  onClickCallBack: (startDate: string, endDate: string) => void;
  kpiType: KpiType;
}
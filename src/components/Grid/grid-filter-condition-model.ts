import { GridFilterOperator } from './grid-filter-operator-type';
import { GridFilterType } from './grid-filter-type';

export interface GridFilterConditionModel {
  filterType: GridFilterType;
  type: GridFilterOperator;
  filter: string;
}
import { GridMultiFilterModel } from './grid-multi-filter-condition-model';
import { GridSingleFilterModel } from './grid-single-filter-condition-model';

export interface GridFilterModel {
  [fieldName: string]: GridMultiFilterModel | GridSingleFilterModel;
}
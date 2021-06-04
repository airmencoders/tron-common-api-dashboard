import { GridFilterConditionModel } from './grid-filter-condition-model';
import { GridFilterType } from './grid-filter-type';
import { GridRelationType } from './grid-relation-type';

export interface GridMultiFilterModel {
  [index: string]: {
    filterType: GridFilterType;
    operator: GridRelationType;
    condition1: GridFilterConditionModel,
    condition2: GridFilterConditionModel,
  }
}
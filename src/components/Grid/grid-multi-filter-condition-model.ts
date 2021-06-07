import { GridFilterType } from './grid-filter-type';
import { GridRelationType } from './grid-relation-type';
import { GridSingleFilterModel } from './grid-single-filter-condition-model';

export interface GridMultiFilterModel {
  filterType: GridFilterType;
  operator: GridRelationType;
  condition1: GridSingleFilterModel,
  condition2: GridSingleFilterModel,
}

/**
 * Tries to determine if given object is an Ag Grid Multi Filter model
 * 
 * @param object the filter to check
 * @returns true if object is Ag Grid Multi Filter Model, false otherwise
 */
export function isAgGridMultiFilter(object: unknown): object is GridMultiFilterModel {
  const objectToCheck = object as GridMultiFilterModel;

  return objectToCheck.hasOwnProperty('filterType') &&
    objectToCheck.hasOwnProperty('operator') &&
    objectToCheck.hasOwnProperty('condition1') &&
    objectToCheck.hasOwnProperty('condition2');
}
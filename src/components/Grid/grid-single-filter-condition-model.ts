import { GridFilterOperatorType } from './grid-filter-operator-type';
import { GridFilterType } from './grid-filter-type';

export interface GridSingleFilterModel {
  filterType: GridFilterType;
  type: GridFilterOperatorType;
  filter: string;
}

/**
 * Tries to determine if given object is an Ag Grid Single Filter model
 * 
 * @param object the filter to check
 * @returns true if object is Ag Grid Single Filter Model, false otherwise
 */
export function isAgGridSingleFilter(object: unknown): object is GridSingleFilterModel {
  const objectToCheck = object as GridSingleFilterModel;

  return objectToCheck.hasOwnProperty('filterType') &&
    objectToCheck.hasOwnProperty('type') &&
    objectToCheck.hasOwnProperty('filter');
}
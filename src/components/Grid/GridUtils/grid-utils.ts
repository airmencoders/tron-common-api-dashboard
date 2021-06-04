import { FilterConditionOperatorEnum, FilterCriteriaRelationTypeEnum, FilterDto } from '../../../openapi';
import { GridFilterParams } from '../grid-filter-params';
import { GridFilterOperator } from '../grid-filter-operator-type';
import { AgGridSortModel } from '../grid-sort-model';
import { InfiniteScroll } from '../infinite-scroll';
import { GridMultiFilterModel } from '../grid-multi-filter-model';
import { GridSingleFilterModel } from '../grid-single-filter-model';
import { AgGridFilterConversionError } from '../../../utils/Exception/AgGridFilterConversionError';

/**
 * Contains all possible Ag Grid filter options
 */
export const agGridFilterOptions = {
  equals: 'equals',
  notEquals: 'notEqual',
  contains: 'contains',
  notContains: 'notContains',
  startsWith: 'startsWith',
  endsWith: 'endsWith',
  lessThan: 'lessThan',
  lessThanOrEqual: 'lessThanOrEqual',
  greaterThan: 'greaterThan',
  greaterThanOrEqual: 'greaterThanOrEqual',
  inRange: 'inRange',
  empty: 'empty'
} as const;

/**
 * @constant agGridDefaults the default values used for AG Grid
 * @property {number} maxBlocksInCache the amount of blocks to keep in cache. Previous blocks will be discard until they are scrolled into view again.
 * @property {number} maxConcurrentDatasourceRequests maximum concurrent requests
 * @property {number} cacheBlockSize the size of the block (the amount of rows returned from a call to the datasource; page limit)
 * @property {GridFilterParams} enumFilterParams default filter params for enum fields
 * @property {GridFilterParams} uuidFilterParams default filter params for uuid fields
 */
export const agGridDefaults = {
  maxBlocksInCache: 5,
  maxConcurrentDatasourceRequests: 1,
  cacheBlockSize: 100
} as const;

/**
 * Calculates the limit (max request items per page) based on options provided or the default if none provided
 * 
 * @param infiniteScroll the infinite scroll options
 * @returns the limit provided by the option or the default
 */
export function generateInfiniteScrollLimit(infiniteScroll?: InfiniteScroll) {
  return infiniteScroll?.limit ?? agGridDefaults.cacheBlockSize;
}

/**
 * Converts Ag Grid operator types to the appropriate types used in API
 * @param operator Ag Grid operator type
 * @returns API compatible operation 
 */
export function convertAgGridFilterTypeToOperator(operator: GridFilterOperator): FilterConditionOperatorEnum {
  switch (operator) {
    case 'contains':
      return FilterConditionOperatorEnum.Like;

    case 'notContains':
      return FilterConditionOperatorEnum.NotLike;

    case 'equals':
      return FilterConditionOperatorEnum.Equals;

    case 'notEqual':
      return FilterConditionOperatorEnum.NotEquals;

    case 'startsWith':
      return FilterConditionOperatorEnum.StartsWith;

    case 'endsWith':
      return FilterConditionOperatorEnum.EndsWith;

    default:
      throw new Error(`${operator} is not supported`);
  }
}

/**
 * Converts Ag Grid single filter model to FilterDto
 * @param filter Ag Grid filter model
 * @returns FilterDto
 */
function convertAgGridSingleFilterToFilterDto(filter: GridSingleFilterModel): FilterDto {
  const filterDto: FilterDto = {
    filterCriteria: []
  };

  Object.keys(filter).forEach(key => {
    const value = filter[key];

    filterDto.filterCriteria.push({
      field: key,
      conditions: [
        {
          operator: convertAgGridFilterTypeToOperator(value.type),
          value: value.filter
        }
      ]
    });

  });

  return filterDto;
}

/**
 * Converts Ag Grid multi filter model to FilterDto
 * @param filter Ag Grid filter model
 * @returns FilterDto
 */
function convertAgGridMultiFilterToFilterDto(filter: GridMultiFilterModel): FilterDto {
  const filterDto: FilterDto = {
    filterCriteria: []
  };

  Object.keys(filter).forEach(key => {
    const value = filter[key];
    // AG Grid multi condition filter
    if (value['condition1'] != null && value['condition2'] != null) {
      const condition1 = value['condition1'];
      const condition2 = value['condition2'];

      filterDto.filterCriteria.push({
        relationType: value.operator === 'OR' ? FilterCriteriaRelationTypeEnum.Or : FilterCriteriaRelationTypeEnum.And,
        field: key,
        conditions: [
          {
            operator: convertAgGridFilterTypeToOperator(condition1.type),
            value: condition1.filter
          },
          {
            operator: convertAgGridFilterTypeToOperator(condition2.type),
            value: condition2.filter
          },
        ]
      });
    }
  });

  return filterDto;
}

/**
 * Converts an Ag Grid filter (single or multi) to FilterDto
 * 
 * @param filter the Ag Grid filter to convert
 * @returns FilterDto
 * @throws {AgGridFilterConversionError} Will throw an error if the appropriate conversion could not be performed
 */
export function convertAgGridFilterToFilterDto(filter: GridMultiFilterModel | GridSingleFilterModel): FilterDto | undefined {
  if (Object.keys(filter).length === 0) {
    return;
  }

  if (isAgGridMultiFilter(filter)) {
    return convertAgGridMultiFilterToFilterDto(filter);
  }

  if (isAgGridSingleFilter(filter)) {
    return convertAgGridSingleFilterToFilterDto(filter);
  }

  throw new AgGridFilterConversionError();
}

/**
 * Tries to determine if given object is an Ag Grid Multi Filter model
 * 
 * @param object the filter to check
 * @returns true if object is Ag Grid Multi Filter Model, false otherwise
 */
function isAgGridMultiFilter(object: GridMultiFilterModel | GridSingleFilterModel): object is GridMultiFilterModel {
  const keys = Object.keys(object);

  if (keys.length > 0) {
    const key = keys[0];
    const value = object[key];

    return value.hasOwnProperty('filterType') &&
      value.hasOwnProperty('operator') &&
      value.hasOwnProperty('condition1') &&
      value.hasOwnProperty('condition2');
  }

  return false;
}

/**
 * Tries to determine if given object is an Ag Grid Single Filter model
 * 
 * @param object the filter to check
 * @returns true if object is Ag Grid Single Filter Model, false otherwise
 */
function isAgGridSingleFilter(object: GridMultiFilterModel | GridSingleFilterModel): object is GridSingleFilterModel {
  const keys = Object.keys(object);

  if (keys.length > 0) {
    const key = keys[0];
    const value = object[key];

    return value.hasOwnProperty('filterType') &&
      value.hasOwnProperty('type') &&
      value.hasOwnProperty('filter');
  }

  return false;
}

/**
 * Converts the sort model that Ag Grid provides to model that API understands
 * @param sort Ag Grid sort 
 * @returns string array
 */
export function convertAgGridSortToQueryParams(sort?: AgGridSortModel[]): string[] | undefined {
  if (sort == null || sort.length === 0) {
    return undefined;
  }

  const queryParams: string[] = [];

  sort.forEach(item => {
    queryParams.push(`${item.colId},${item.sort}`);
  });

  return queryParams;
}

/**
 * Creates default GridFilterParams based on field type
 * 
 * @param type the field type
 * @returns default GridFilterParams if one exists for type, undefined otherwise
 */
export function createDefaultGridFilterParamsForType(type: 'enum' | 'uuid'): GridFilterParams | undefined {
  switch (type) {
    case 'enum':
    case 'uuid':
      return {
        filterOptions: [agGridFilterOptions.equals, agGridFilterOptions.notEquals]
      };

    default:
      return undefined;
  }
}
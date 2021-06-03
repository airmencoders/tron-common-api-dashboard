import { FilterConditionOperatorEnum, FilterDto } from '../../../openapi';
import { GridFilterParams } from '../grid-filter-params';
import { AgGridSortModel } from '../grid-sort-model';
import { InfiniteScroll } from '../infinite-scroll';

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
 * Converts Ag Grid filter types to the appropriate types used in API
 * @param filterType Ag Grid filter type
 * @returns API compatible operation 
 */
export function convertAgGridFilterTypeToOperator(filterType: string): FilterConditionOperatorEnum {
  switch (filterType) {
    case agGridFilterOptions.contains:
      return FilterConditionOperatorEnum.Like;

    case agGridFilterOptions.notContains:
      return FilterConditionOperatorEnum.NotLike;

    case agGridFilterOptions.equals:
      return FilterConditionOperatorEnum.Equals;

    case agGridFilterOptions.notEquals:
      return FilterConditionOperatorEnum.NotEquals;

    case agGridFilterOptions.startsWith:
      return FilterConditionOperatorEnum.StartsWith;

    case agGridFilterOptions.endsWith:
      return FilterConditionOperatorEnum.EndsWith;

    default:
      throw new Error(`${filterType} is not supported`);
  }
}

/**
 * Converts Ag Grid filter model to FilterDto
 * @param filter Ag Grid filter model
 * @returns FilterDto
 */
export function convertAgGridFilterToFilterDto(filter: any): FilterDto {
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
        relationType: value.operator,
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
    } else {
      filterDto.filterCriteria.push({
        field: key,
        conditions: [
          {
            operator: convertAgGridFilterTypeToOperator(value.type),
            value: value.filter
          }
        ]
      });
    }
  });

  return filterDto;
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
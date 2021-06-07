import React from 'react';
import { FilterConditionOperatorEnum, FilterCriteria, FilterCriteriaRelationTypeEnum, FilterDto } from '../../openapi';
import { AgGridFilterConversionError } from '../../utils/Exception/AgGridFilterConversionError';
import { GridFilterModel } from './grid-filter-model';
import { GridFilterOperatorType } from './grid-filter-operator-type';
import { GridMultiFilterModel, isAgGridMultiFilter } from './grid-multi-filter-condition-model';
import { GridSingleFilterModel, isAgGridSingleFilter } from './grid-single-filter-condition-model';

export class GridFilter {
  constructor(private gridFilter: GridFilterModel) {
    this.gridFilter = gridFilter;
  }

  /**
   * Gets the FilterDto
   * @returns the FilterDto value, or undefined if no filter exists
   * @throws {AgGridFilterConversionError} Throws error if filter could not be converted
   */
  getFilterDto(): FilterDto | undefined {
    const fieldNames = Object.keys(this.gridFilter);

    if (fieldNames.length === 0) {
      return;
    }

    const filterDto: FilterDto = {
      filterCriteria: []
    };

    try {
      for (const fieldName of fieldNames) {
        const filter = this.gridFilter[fieldName];

        filterDto.filterCriteria.push(GridFilter.convertAgGridFilterToFilterCriteria(fieldName, filter));
      }
    } catch (err) {
      throw err;
    }

    return filterDto;
  }

  /**
   * Converts a filter to FilterCriteria
   * @param fieldName the field name this filter belongs to
   * @param filter the filter to convert to FilterCriteria
   * @returns {FilterCriteria} the converted value
   * @throws {AgGridFilterConversionError} error thrown if the given filter could not be converted to FilterCriteria
   */
  private static convertAgGridFilterToFilterCriteria(fieldName: string, filter: GridSingleFilterModel | GridMultiFilterModel): FilterCriteria {
    if (isAgGridMultiFilter(filter)) {
      return GridFilter.convertAgGridMultiFilterToFilterCritiera(fieldName, filter);
    }

    if (isAgGridSingleFilter(filter)) {
      return GridFilter.convertAgGridSingleFilterToFilterCriteria(fieldName, filter);
    }

    throw new AgGridFilterConversionError();
  }

  /**
   * Converts Ag Grid single filter model to FilterCriteria
   * @param {string} fieldName the name of the field that this filter belongs to
   * @param {GridSingleFilterModel} filter the filter model to convert
   * @returns {FilterCriteria} the converted value
   */
  private static convertAgGridSingleFilterToFilterCriteria(fieldName: string, filter: GridSingleFilterModel): FilterCriteria {
    const filterCriteria: FilterCriteria = {
      field: fieldName,
      conditions: [
        {
          operator: GridFilter.convertAgGridFilterTypeToOperator(filter.type),
          value: filter.filter
        }
      ]
    }

    return filterCriteria;
  }

  /**
   * Converts Ag Grid multi filter model to FilterCriteria
   * @param {string} fieldName the name of the field that this filter belongs to
   * @param {GridMultiFilterModel} filter the filter model to convert
   * @returns {FilterCriteria} the converted value
   */
  private static convertAgGridMultiFilterToFilterCritiera(fieldName: string, filter: GridMultiFilterModel): FilterCriteria {
    const filterCritiera: FilterCriteria = {
      relationType: filter.operator === 'OR' ? FilterCriteriaRelationTypeEnum.Or : FilterCriteriaRelationTypeEnum.And,
      field: fieldName,
      conditions: [
        {
          operator: GridFilter.convertAgGridFilterTypeToOperator(filter.condition1.type),
          value: filter.condition1.filter
        },
        {
          operator: GridFilter.convertAgGridFilterTypeToOperator(filter.condition2.type),
          value: filter.condition2.filter
        }
      ]
    }

    return filterCritiera;
  }


  /**
   * Converts Ag Grid operator types to the appropriate types used in API
   * @param operator Ag Grid operator type
   * @returns API compatible operation 
   * @throws {Error} throws error if given operator is not supported
   */
  private static convertAgGridFilterTypeToOperator(operator: GridFilterOperatorType): FilterConditionOperatorEnum {
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
}
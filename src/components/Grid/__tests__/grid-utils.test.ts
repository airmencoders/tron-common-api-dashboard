import { AgGridFilterConversionError } from '../../../utils/Exception/AgGridFilterConversionError';
import { GridMultiFilterModel } from '../grid-multi-filter-model';
import { GridSingleFilterModel } from '../grid-single-filter-model';
import { agGridDefaults, agGridFilterOptions, convertAgGridFilterToFilterDto, convertAgGridFilterTypeToOperator, convertAgGridSortToQueryParams, createDefaultGridFilterParamsForType, generateInfiniteScrollLimit } from '../GridUtils/grid-utils';
import { InfiniteScroll } from '../infinite-scroll';

describe('Grid Utils Test', () => {
  it('Should generate infinite scroll limit correctly', () => {
    const infiniteScroll: InfiniteScroll = {
      enabled: true,
      limit: 10
    };

    // Should return limit from infiniteScroll
    let limit = generateInfiniteScrollLimit(infiniteScroll);
    expect(limit).toEqual(infiniteScroll.limit);

    // Should return default value
    limit = generateInfiniteScrollLimit();
    expect(limit).toEqual(agGridDefaults.cacheBlockSize);
  });

  [
    agGridFilterOptions.contains,
    agGridFilterOptions.notContains,
    agGridFilterOptions.equals,
    agGridFilterOptions.notEquals,
    agGridFilterOptions.startsWith,
    agGridFilterOptions.endsWith
  ].forEach(item => {
    it('Should return API specific Operation given Ag Grid filter type', () => {
      expect(() => convertAgGridFilterTypeToOperator(item)).not.toThrow();
    });
  });

  it('Should throw error on non-supported Ag Grid filter type', () => {
    expect(() => convertAgGridFilterTypeToOperator('greaterThan')).toThrow();
  });

  it('Should convert Ag Grid multi-condition filter model to API FilterDto model', () => {
    const agGridFilterModel: GridMultiFilterModel = {
      "firstName": {
        "filterType": "text",
        "operator": "AND",
        "condition1": {
          "filterType": "text",
          "type": "contains",
          "filter": "d"
        },
        "condition2": {
          "filterType": "text",
          "type": "notContains",
          "filter": "1"
        }
      }
    };

    const filterDto = {
      "filterCriteria": [
        {
          "relationType": "AND",
          "field": "firstName",
          "conditions": [
            {
              "operator": "LIKE",
              "value": "d"
            },
            {
              "operator": "NOT_LIKE",
              "value": "1"
            }
          ]
        }
      ]
    };

    expect(convertAgGridFilterToFilterDto(agGridFilterModel)).toEqual(filterDto);
  });

  it('Should convert Ag Grid single condition filter model to API FilterDto model', () => {
    const agGridFilterModel: GridSingleFilterModel = {
      "firstName": {
        "filterType": "text",
        "type": "contains",
        "filter": "d"
      }
    };

    const filterDto = {
      "filterCriteria": [
        {
          "field": "firstName",
          "conditions": [
            {
              "operator": "LIKE",
              "value": "d"
            }
          ]
        }
      ]
    };

    expect(convertAgGridFilterToFilterDto(agGridFilterModel)).toEqual(filterDto);
  });

  it('Should throw error trying to convert bad Ag Grid Filter to API FilterDto model', () => {
    expect(() => convertAgGridFilterToFilterDto({ asd: "asd" } as any)).toThrow(AgGridFilterConversionError);
  });

  it('Should convert Ag Grid sort to API query params', () => {
    const agGridSort = [
      {
        "sort": "asc",
        "colId": "email"
      }
    ];

    const queryParams = [
      "email,asc"
    ];

    // try valid
    expect(convertAgGridSortToQueryParams(agGridSort)).toEqual(queryParams);

    // send undefined & empty
    expect(convertAgGridSortToQueryParams([])).toBe(undefined);
    expect(convertAgGridSortToQueryParams(undefined)).toBe(undefined);
  });

  it('Should create default GridFilterParams for associated types', () => {
    const expected = {
      filterOptions: [agGridFilterOptions.equals, agGridFilterOptions.notEquals]
    };

    expect(createDefaultGridFilterParamsForType('enum')).toEqual(expected);
    expect(createDefaultGridFilterParamsForType('uuid')).toEqual(expected);
  });
});
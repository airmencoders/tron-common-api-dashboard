import { agGridDefaults, agGridFilterOptions, convertAgGridSortToQueryParams, createDefaultGridFilterParamsForType, generateInfiniteScrollLimit } from '../GridUtils/grid-utils';
import { InfiniteScrollOptions } from '../../DataCrudFormPage/infinite-scroll-options';

describe('Grid Utils Test', () => {
  it('Should generate infinite scroll limit correctly', () => {
    const infiniteScroll: InfiniteScrollOptions = {
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
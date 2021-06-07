import { FilterConditionOperatorEnum, FilterCriteriaRelationTypeEnum, FilterDto } from '../../../openapi';
import { AgGridFilterConversionError } from '../../../utils/Exception/AgGridFilterConversionError';
import { GridFilter } from '../grid-filter';

describe('Grid Filter tests', () => {
  it('Should throw error on non-supported Ag Grid filter type', () => {
    const gridFilter: GridFilter = new GridFilter({
      "firstName": {
        "filterType": "text",
        "type": "greaterThan",
        "filter": "d"
      }
    });

    expect(() => gridFilter.getFilterDto()).toThrow();
  });

  it('Should convert Ag Grid multi-condition filter model to API FilterDto model', () => {
    const gridFilter: GridFilter = new GridFilter({
      "firstName": {
        "filterType": "text",
        "operator": "AND",
        "condition1": {
          "filterType": "text",
          "type": "equals",
          "filter": "d"
        },
        "condition2": {
          "filterType": "text",
          "type": "notEqual",
          "filter": "1"
        }
      },
      "email": {
        "filterType": "text",
        "operator": "OR",
        "condition1": {
          "filterType": "text",
          "type": "startsWith",
          "filter": "1"
        },
        "condition2": {
          "filterType": "text",
          "type": "endsWith",
          "filter": ".com"
        }
      }
    });

    const filterDto: FilterDto = {
      "filterCriteria": [
        {
          "relationType": FilterCriteriaRelationTypeEnum.And,
          "field": "firstName",
          "conditions": [
            {
              "operator": FilterConditionOperatorEnum.Equals,
              "value": "d"
            },
            {
              "operator": FilterConditionOperatorEnum.NotEquals,
              "value": "1"
            }
          ]
        },
        {
          "relationType": FilterCriteriaRelationTypeEnum.Or,
          "field": "email",
          "conditions": [
            {
              "operator": FilterConditionOperatorEnum.StartsWith,
              "value": "1"
            },
            {
              "operator": FilterConditionOperatorEnum.EndsWith,
              "value": ".com"
            }
          ]
        }
      ]
    };

    expect(gridFilter.getFilterDto()).toEqual(filterDto);
  });

  it('Should convert Ag Grid single condition filter model to API FilterDto model', () => {
    const gridFilter: GridFilter = new GridFilter({
      "firstName": {
        "filterType": "text",
        "type": "contains",
        "filter": "d"
      }
    });

    const filterDto: FilterDto = {
      "filterCriteria": [
        {
          "field": "firstName",
          "conditions": [
            {
              "operator": FilterConditionOperatorEnum.Like,
              "value": "d"
            }
          ]
        }
      ]
    };

    expect(gridFilter.getFilterDto()).toEqual(filterDto);
  });

  it('Should throw error trying to convert bad Ag Grid Filter to API FilterDto model', () => {
    let gridFilter: GridFilter = new GridFilter({
      "firstName": {
        "bad": "bad"
      } as any
    });

    expect(() => gridFilter.getFilterDto()).toThrow(AgGridFilterConversionError);

    gridFilter = new GridFilter({
      "firstName": {} as any
    });

    expect(() => gridFilter.getFilterDto()).toThrow(AgGridFilterConversionError);
  });

  it('Should return undefined when given empty filter', () => {
    let gridFilter: GridFilter = new GridFilter({});

    expect(gridFilter.getFilterDto()).toEqual(undefined);
  });
});
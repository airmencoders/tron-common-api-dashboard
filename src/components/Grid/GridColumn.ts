import { GridFilterParams } from './grid-filter-params';
import { GridColumnParams } from "./GridColumnParams";
import {GridColumnPinnedOption} from './grid-column-pinned-option';
import { ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';

export default class GridColumn {
  constructor(params: Partial<GridColumnParams>) {
    const {
      field = '',
      sortable = false,
      filter = false,
      headerName = '',
      headerClass = '',
      cellRenderer,
      cellRendererParams,
      resizable = false,
      showTooltip = true,
      checkboxSelection = false,
      headerCheckboxSelection = false,
      headerCheckboxSelectionFilteredOnly = false,
      pinned = undefined,
      initialWidth = undefined,
      filterParams = undefined,
      valueGetter = undefined,
      valueFormatter = undefined
    } = params;

    this._field = field;
    this._sortable = sortable;
    this._filter = filter;
    this._headerName = headerName;
    this._headerClass = headerClass;
    this._cellRenderer = cellRenderer;
    this._cellRendererParams = cellRendererParams;
    this._resizable = resizable;
    this._showTooltip = showTooltip;
    this._checkboxSelection = checkboxSelection;
    this._headerCheckboxSelection = headerCheckboxSelection;
    this._headerCheckboxSelectionFilteredOnly = headerCheckboxSelectionFilteredOnly;
    this._filterParams = filterParams;
    this._pinned = pinned;
    this._initialWidth = initialWidth;
    this._valueGetter = valueGetter;
    this._valueFormatter = valueFormatter;
  }

  private _field: string;
  private _sortable: boolean;
  private _filter: boolean;
  private _headerName: string;
  private _headerClass: string;
  private _cellRenderer?: React.ReactNode;
  private _cellRendererParams?: any;
  private _resizable: boolean;
  private _showTooltip: boolean;
  private _checkboxSelection: boolean;
  private _headerCheckboxSelection: boolean;
  private _headerCheckboxSelectionFilteredOnly: boolean;
  private _filterParams?: GridFilterParams;
  private _pinned: GridColumnPinnedOption;
  private _initialWidth: number | undefined;
  private _valueGetter?: (params: ValueGetterParams) => any;
  private _valueFormatter?: (params: ValueFormatterParams) => any;

  get field(): string {
    return this._field;
  }

  get sortable(): boolean {
    return this._sortable;
  }

  get filter(): boolean {
    return this._filter;
  }

  get headerName(): string {
    return this._headerName;
  }

  get headerClass(): string {
    return this._headerClass;
  }

  get cellRenderer(): React.ReactNode {
    return this._cellRenderer;
  }

  get cellRendererParams(): any {
    return this._cellRendererParams;
  }

  get resizable(): boolean {
    return this._resizable;
  }

  get showTooltip(): boolean {
    return this._showTooltip;
  }

  get checkboxSelection(): boolean {
    return this._checkboxSelection;
  }

  get headerCheckboxSelection(): boolean {
    return this._headerCheckboxSelection;
  }

  get headerCheckboxSelectionFilteredOnly(): boolean {
    return this._headerCheckboxSelectionFilteredOnly;
  }

  get filterParams(): GridFilterParams | undefined {
    return this._filterParams;
  }

  get pinned(): GridColumnPinnedOption {
    return this._pinned;
  }

  get intialWidth(): number | undefined {
    return this._initialWidth;
  }

  get valueGetter(): ((params: ValueGetterParams) => any) | undefined {
    return this._valueGetter;
  }

  get valueFormatter(): ((params: ValueFormatterParams) => any) | undefined {
    return this._valueFormatter;
  }

  static get defaultValueGetter() {
    return function deleteValueGetter(params: ValueGetterParams) {
      return params.data;
    };
  }
}

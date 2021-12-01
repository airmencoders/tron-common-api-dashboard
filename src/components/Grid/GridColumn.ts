import { GridFilterParams } from './grid-filter-params';
import { GridColumnParams } from "./GridColumnParams";
import {GridColumnPinnedOption} from './grid-column-pinned-option';
import { CheckboxSelectionCallbackParams, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';

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
      cellStyle,
      resizable = false,
      showTooltip = true,
      checkboxSelection = false,
      headerCheckboxSelection = false,
      headerCheckboxSelectionFilteredOnly = false,
      pinned = undefined,
      initialWidth = undefined,
      filterParams = undefined,
      valueGetter = undefined,
      valueFormatter = undefined,
      hide = false,
      maxWidth = undefined
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
    this._cellStyle = cellStyle;
    this._initialWidth = initialWidth;
    this._valueGetter = valueGetter;
    this._valueFormatter = valueFormatter;
    this._hide = hide;
    this._maxWidth = maxWidth;
  }

  private _field: string;
  private _sortable: boolean;
  private _filter: boolean | string;
  private _headerName: string;
  private _headerClass: string;
  private _cellRenderer?: React.ReactNode;
  private _cellRendererParams?: any;
  private _resizable: boolean;
  private _showTooltip: boolean;
  private _cellStyle: any;
  private _checkboxSelection: boolean | ((params: CheckboxSelectionCallbackParams) => boolean);
  private _headerCheckboxSelection: boolean;
  private _headerCheckboxSelectionFilteredOnly: boolean;
  private _filterParams?: GridFilterParams;
  private _pinned: GridColumnPinnedOption;
  private _initialWidth: number | undefined;
  private _valueGetter?: (params: ValueGetterParams) => any;
  private _valueFormatter?: (params: ValueFormatterParams) => any;
  private _hide: boolean;
  private _maxWidth?: number;

  get field(): string {
    return this._field;
  }

  get sortable(): boolean {
    return this._sortable;
  }

  get filter(): boolean | string {
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

  get cellStyle(): React.ReactNode {
    return this._cellStyle;
  }

  get cellRendererParams(): any {
    return this._cellRendererParams;
  }

  set cellRendererParams(params: any) {
    this._cellRendererParams = params;
  }

  get resizable(): boolean {
    return this._resizable;
  }

  get showTooltip(): boolean {
    return this._showTooltip;
  }

  get checkboxSelection(): boolean | ((params: CheckboxSelectionCallbackParams) => boolean) {
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

  get hide(): boolean {
    return this._hide;
  }

  set hide(shouldHide: boolean) {
    this._hide = shouldHide;
  }

  get maxWidth(): number | undefined {
    return this._maxWidth;
  } 

  static get defaultValueGetter() {
    return function defaultValueGetter(params: ValueGetterParams) {
      return params.data;
    };
  }
}

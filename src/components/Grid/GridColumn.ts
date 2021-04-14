import { GridColumnParams } from "./GridColumnParams";

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
      showTooltip = false
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
}

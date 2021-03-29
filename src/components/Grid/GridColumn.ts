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
    } = params;

    this._field = field;
    this._sortable = sortable;
    this._filter = filter;
    this._headerName = headerName;
    this._headerClass = headerClass;
    this._cellRenderer = cellRenderer;
    this._cellRendererParams = cellRendererParams;
  }

  private _field: string;
  private _sortable: boolean;
  private _filter: boolean;
  private _headerName: string;
  private _headerClass: string;
  private _cellRenderer?: React.ReactNode;
  private _cellRendererParams?: any;

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
}

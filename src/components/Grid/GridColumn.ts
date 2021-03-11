
export default class GridColumn {


  constructor(
      private _field: string,
      private _sortable: boolean,
      private _filter: boolean,
      private _headerName: string = '',
      private _headerClass: string = '',
      private _cellRenderer: React.ReactNode = undefined,
      private _cellRendererParams: any = undefined
  ) { }

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


export default class GridColumn {


  constructor(
      private _field: string,
      private _sortable: boolean,
      private _filter: boolean,
      private _headerName: string = '',
      private _cellRenderer: React.ReactNode = undefined
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

  get cellRenderer(): React.ReactNode {
    return this._cellRenderer;
  }
}


export default class GridColumn {


  constructor(
      private _field: string,
      private _sortable: boolean,
      private _filter: boolean,
      private _headerName: string = ''
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
}

import {ColumnApi, GridApi, RowNode} from 'ag-grid-community';

/**
 * T Cell Renderer Params
 */
export interface GridCellRendererProps<T> {
  api: GridApi,
  colDef: any,
  columnApi: ColumnApi,
  data: any,
  node: RowNode,
  cellRendererParams: T
}

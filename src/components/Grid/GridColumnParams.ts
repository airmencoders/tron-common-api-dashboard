import { GridFilterParams } from './grid-filter-params';

import {GridColumnPinnedOption} from './grid-column-pinned-option';
import { ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';

export interface GridColumnParams {
  field: string;
  sortable: boolean;
  filter: boolean;
  headerName: string;
  headerClass: string;
  cellRenderer: React.ReactNode;
  cellRendererParams: any;
  resizable: boolean;
  showTooltip: boolean;
  checkboxSelection: boolean;
  headerCheckboxSelection: boolean;
  headerCheckboxSelectionFilteredOnly: boolean;
  pinned: GridColumnPinnedOption,
  initialWidth: number | undefined; // in pixels
  filterParams: GridFilterParams;
  valueGetter?: (params: ValueGetterParams) => any;
  valueFormatter?: (params: ValueFormatterParams) => any;
  hide?: boolean;
  maxWidth?: number;
}

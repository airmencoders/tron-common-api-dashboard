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
}
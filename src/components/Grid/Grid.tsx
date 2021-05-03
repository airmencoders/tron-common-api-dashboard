import { useHookstate } from '@hookstate/core';
import { GridApi } from 'ag-grid-community';
import { GridReadyEvent, RowSelectedEvent } from 'ag-grid-community/dist/lib/events';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import React, { useEffect, useRef, useState } from 'react';
import './Grid.scss';
import { GridProps } from './GridProps';

function Grid(props: GridProps) {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const gridReady = (event: GridReadyEvent) => {
    event.api.sizeColumnsToFit();

    setGridApi(event.api);

    // call parent's onReady if present
    props.onGridReady && props.onGridReady(event.api);
  };

  const rowDataLengthChanged = useRef(false);

  // Only reset grid data when the length has changed
  useEffect(() => {
    rowDataLengthChanged.current = true;

    gridApi?.setRowData(props.data);
  }, [props.data.length]);

  // Refresh grid cells only if the length of the dat has not changed
  useEffect(() => {
    if (!rowDataLengthChanged.current) {
      props.hardRefresh ? gridApi?.setRowData(props.data) : gridApi?.refreshCells();
    } else {
      rowDataLengthChanged.current = false;
    }
  }, [props.data]);

  const windowWidth = useHookstate<number>(window.innerWidth);
  // Keep track of the size of the window width
  useEffect(() => {
    function onResize() {
      windowWidth.set(window.innerWidth);
    }

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, []);

  // Resize the grid columns if necessary
  useEffect(() => {
    if (props.autoResizeColumns && window.innerWidth > (props.autoResizeColummnsMinWidth ?? 0))
      gridApi?.sizeColumnsToFit();

  }, [windowWidth.get()])

  function onRowSelected(event: RowSelectedEvent) {
    const data = event.data;
    const isSelected = event.node.isSelected();

    props.onRowSelected?.(data, isSelected ? 'selected' : 'unselected');
  }

  return (
      <div className={`grid-component ${props.className}`}
           style={{ width: '100%', height: props.height ?? '60vh'}}
      >
        <div className="ag-theme-alpine" style={{ width: '100%', height: '100%'}}>
          <AgGridReact              
              rowData={props.data}
              onGridReady={gridReady}
              onRowClicked={props.onRowClicked}
              rowClass={props.rowClass}
              quickFilterText={props.quickFilterText || ''}
              rowSelection={props.rowSelection || 'none'}
              suppressColumnVirtualisation={!process.env.NODE_ENV || process.env.NODE_ENV === 'test' || props.disabledGridColumnVirtualization}
              enableBrowserTooltips
              suppressRowClickSelection={props.suppressRowClickSelection}
              onRowSelected={onRowSelected}
          >
            {
              props.columns.map(col => (
                <AgGridColumn
                    key={col.field}
                    field={col.field}
                    headerName={col.headerName}
                    sortable={col.sortable}
                    filter={col.filter}
                    headerClass={col.headerClass}
                    cellRendererFramework={col.cellRenderer}
                    cellRendererParams={col.cellRendererParams}
                    tooltipField={col.showTooltip ? col.field : undefined}
                    resizable={col.resizable}
                    checkboxSelection={col.checkboxSelection}
                    headerCheckboxSelection={col.headerCheckboxSelection}
                    headerCheckboxSelectionFilteredOnly={col.headerCheckboxSelectionFilteredOnly}
                />
              ))
            }
          </AgGridReact>
        </div>
      </div>
  );
}

export default Grid;

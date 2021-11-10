import { useHookstate } from '@hookstate/core';
import { GridApi } from 'ag-grid-community';
import { GridReadyEvent, ModelUpdatedEvent, RowSelectedEvent, SelectionChangedEvent } from 'ag-grid-community/dist/lib/events';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import React, { useEffect, useRef, useState } from 'react';
import './Grid.scss';
import { GridProps } from './GridProps';
import { agGridDefaults } from './GridUtils/grid-utils';
import { InfiniteScrollGridProps } from './InfiniteScrollGrid/InfiniteScrollGridProps';
import { GridSelectionType } from './grid-selection-type';

function Grid(props: GridProps & Partial<InfiniteScrollGridProps>) {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const gridSizeRef = useRef(null);
  const gridReady = (event: GridReadyEvent) => {
    setGridApi(event.api);

    // call parent's onReady if present
    props.onGridReady && props.onGridReady(event.api);
  };

  const onModelUpdated = (event: ModelUpdatedEvent) => {
    event.api.sizeColumnsToFit();
  }

  const rowDataLengthChanged = useRef(false);

  // Only reset grid data when the length has changed
  useEffect(() => {
    if (!props.data)
      return;

    if (props.datasource)
      return;

    rowDataLengthChanged.current = true;

    gridApi?.setRowData(props.data);
  }, [props.data?.length]);

  // Refresh grid cells only if the length of the data has not changed
  useEffect(() => {
    if (!props.data)
      return;

    if (props.datasource)
      return;

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

  // Handles updating infinite scroll cache
  useEffect(() => {
    if (props.updateInfiniteCache) {
      gridApi?.refreshInfiniteCache();
      props.updateInfiniteCacheCallback?.();
    }
  }, [props.updateInfiniteCache]);

  // Handles scrolling to top
  useEffect(() => {
    if (props.scrollToTop) {
      gridApi?.purgeInfiniteCache();
      gridApi?.ensureIndexVisible(0);
      props.scrollToTopCallback?.();
    }
  }, [props.scrollToTop]);


  function onRowSelected(event: RowSelectedEvent) {
    const data = event.data;
    const isSelected = event.node.isSelected();

    props.onRowSelected?.(data, isSelected ? 'selected' : 'unselected');
  }

  function onSelectionChanged(event: SelectionChangedEvent) {
    if (props.rowSelection !== 'single') {
      return;
    }
    
    const data = event.api.getSelectedNodes();

    if (data.length > 0) {
      props.onSelectionChanged?.(data[0].data);
    } else {
      props.onSelectionChanged?.();
    }
  }

  return (
      <div className={`grid-component ${props.className}`}
           style={{ width: '100%', height: props.height ?? '60vh'}}
      >
        <div className="ag-theme-alpine" style={{ width: '100%', height: '100%'}}>
          <div className="grid-size-ref" style={{ width: 'auto', height: '100%'}}
               ref={gridSizeRef}
          >
            <AgGridReact
                rowData={props.data}
                onGridReady={gridReady}
                onModelUpdated={onModelUpdated}
                onRowClicked={props.onRowClicked}
                rowClass={props.rowClass}
                quickFilterText={props.quickFilterText || ''}
                rowSelection={props.rowSelection || 'none'}
                suppressColumnVirtualisation={!process.env.NODE_ENV || process.env.NODE_ENV === 'test' || props.disabledGridColumnVirtualization}
                enableBrowserTooltips
                suppressRowClickSelection={props.suppressRowClickSelection}
                onRowSelected={onRowSelected}
                rowModelType={props.rowModelType}
                datasource={props.datasource}
                cacheBlockSize={props.cacheBlockSize ?? agGridDefaults.cacheBlockSize}
                maxConcurrentDatasourceRequests={props.maxConcurrentDatasourceRequests ?? agGridDefaults.maxConcurrentDatasourceRequests}
                maxBlocksInCache={props.maxBlocksInCache ?? agGridDefaults.maxBlocksInCache}
                getRowNodeId={props.getRowNodeId}
                immutableData={props.immutableData}
                suppressCellSelection={props.suppressCellSelection}
                onSelectionChanged={onSelectionChanged}
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
                      pinned={col.pinned}
                      initialWidth={col.intialWidth}
                      filterParams={col.filterParams}
                      valueGetter={col.valueGetter}
                      valueFormatter={col.valueFormatter}
                  />
                ))
              }
            </AgGridReact>
          </div>
        </div>
      </div>
  );
}

export default Grid;

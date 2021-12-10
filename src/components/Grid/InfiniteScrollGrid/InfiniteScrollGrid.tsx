import React, { useEffect, useRef } from 'react';
import { InfiniteScrollGridProps } from './InfiniteScrollGridProps';
import { GridProps } from '../GridProps';
import Grid from '../Grid';
import { GridApi } from 'ag-grid-community';

function InfiniteScrollGrid(props: InfiniteScrollGridProps & GridProps) {
  const gridApi = useRef<GridApi | undefined>(undefined);

  function onGridReady(api?: GridApi) {
    gridApi.current = api;
    if (props.onGridReady != null) {
      props.onGridReady(api);
    }
  }
  useEffect(() => {
    if (!props.updateDatasource) {
      return;
    }

    const datasource = props.datasource;
    if (datasource) {
      gridApi.current?.setDatasource(datasource);
      gridApi.current?.deselectAll();
    }

    props.updateDatasourceCallback?.();
  }, [props.datasource]);

  return (
    <Grid
      columns={props.columns}
      onRowClicked={props.onRowClicked}
      rowClass={props.rowClass}
      autoResizeColumns={props.autoResizeColumns}
      autoResizeColummnsMinWidth={props.autoResizeColummnsMinWidth}
      forceCellRefreshOnResize={props.forceCellRefreshOnResize}
      disabledGridColumnVirtualization={props.disabledGridColumnVirtualization}
      rowModelType="infinite"
      rowSelection={props.rowSelection ?? "single"}
      datasource={props.datasource}
      cacheBlockSize={props.cacheBlockSize}
      maxBlocksInCache={props.maxBlocksInCache}
      maxConcurrentDatasourceRequests={props.maxConcurrentDatasourceRequests}
      updateInfiniteCache={props.updateInfiniteCache}
      updateInfiniteCacheCallback={props.updateInfiniteCacheCallback}
      getRowNodeId={props.getRowNodeId}
      suppressRowClickSelection={props.suppressRowClickSelection}
      onRowSelected={props.onRowSelected}
      scrollToTop={props.scrollToTop}
      scrollToTopCallback={props.scrollToTopCallback}
      suppressCellSelection={props.suppressCellSelection}
      onGridReady={onGridReady}
      onSelectionChanged={props.onSelectionChanged}
    />
  );
}

export default InfiniteScrollGrid;
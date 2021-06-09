import React from 'react';
import { InfiniteScrollGridProps } from './InfiniteScrollGridProps';
import { GridProps } from '../GridProps';
import Grid from '../Grid';

function InfiniteScrollGrid(props: InfiniteScrollGridProps & GridProps) {
  return (
    <Grid
      columns={props.columns}
      onRowClicked={props.onRowClicked}
      rowClass={props.rowClass}
      autoResizeColumns={props.autoResizeColumns}
      autoResizeColummnsMinWidth={props.autoResizeColummnsMinWidth}
      disabledGridColumnVirtualization={props.disabledGridColumnVirtualization}
      rowModelType="infinite"
      datasource={props.datasource}
      cacheBlockSize={props.cacheBlockSize}
      maxBlocksInCache={props.maxBlocksInCache}
      maxConcurrentDatasourceRequests={props.maxConcurrentDatasourceRequests}
      updateInfiniteCache={props.updateInfiniteCache}
      updateInfiniteCacheCallback={props.updateInfiniteCacheCallback}
    />
  );
}

export default InfiniteScrollGrid;
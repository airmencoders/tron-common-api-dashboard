import { IDatasource } from 'ag-grid-community';

export interface InfiniteScrollGridProps {
  maxConcurrentDatasourceRequests?: number;
  maxBlocksInCache?: number;
  datasource: IDatasource;
  cacheBlockSize?: number;
  updateInfiniteCache?: boolean;
  updateInfiniteCacheCallback?: () => void;
}
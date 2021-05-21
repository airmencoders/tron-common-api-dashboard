/**
 * Interface to provide grid InfiniteScroll options
 * @interface 
 * @member enabled true if using infinite scroll, false otherwise
 * @member limit the number of items to request
 * @member maxConcurrentDatasourceRequests maximum concurrent requests
 * @member maxBlocksInCache maximum blocks of data to keep
 */
export interface InfiniteScroll {
  enabled: boolean;
  limit?: number;
  maxConcurrentDatasourceRequests?: number;
  maxBlocksInCache?: number;
}
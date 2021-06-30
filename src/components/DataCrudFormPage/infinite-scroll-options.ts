/**
 * @interface InfiniteScrollOptions interface to provide DataCrudFormPage Grid Infinite Scroll options
 * @member enabled true if using infinite scroll, false otherwise
 * @member limit the number of items to request
 * @member maxConcurrentDatasourceRequests maximum concurrent requests
 * @member maxBlocksInCache maximum blocks of data to keep
 */
export interface InfiniteScrollOptions {
  enabled: boolean;
  limit?: number;
  maxConcurrentDatasourceRequests?: number;
  maxBlocksInCache?: number;
}
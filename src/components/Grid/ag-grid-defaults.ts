/**
 * @constant agGridDefaults the default values used for AG Grid
 * @property {number} maxBlocksInCache the amount of blocks to keep in cache. Previous blocks will be discard until they are scrolled into view again.
 * @property {number} maxConcurrentDatasourceRequests maximum concurrent requests
 * @property {number} cacheBlockSize the size of the block (the amount of rows returned from a call to the datasource; page limit)
 */
export const agGridDefaults = {
  maxBlocksInCache: 5,
  maxConcurrentDatasourceRequests: 1,
  cacheBlockSize: 100
} as const;
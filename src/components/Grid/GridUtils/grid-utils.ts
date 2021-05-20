import { agGridDefaults } from '../ag-grid-defaults';
import { InfiniteScroll } from '../infinite-scroll';

/**
 * Calculates the limit (max request items per page) based on options provided or the default if none provided
 * 
 * @param infiniteScroll the infinite scroll options
 * @returns the limit provided by the option or the default
 */
export function generateInfiniteScrollLimit(infiniteScroll?: InfiniteScroll) {
  return infiniteScroll?.limit ?? agGridDefaults.cacheBlockSize;
}
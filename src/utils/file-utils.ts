import { DocumentDto } from "../openapi";

/**
 * Formats number of bytes to a string value represented in (KB, MB, GB, etc)
 * 
 * @param bytes number of bytes
 * @param decimals precision
 * @returns formatted size as string
 */
export function formatBytesToString(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export interface UniqueSpaceAndPathItems {
  spaceId: string,
  path: string,
  items: string[],
}

/**
 * Takes a list of DocumentDtos from across multiple spaces and reduces them to a list 
 * whose elements are unique in their spaceId/path values
 * @param list list of document dtos possible spanning multiple spaces and paths
 * @returns list of UniqueSpaceAndPathItems
 */
export function reduceDocumentDtoListToUnique(list: DocumentDto[]): UniqueSpaceAndPathItems[] {
  if (list == undefined) { return []; }

  // sort the ones we want to delete into 'buckets' of spaceId
  const uniqSpaceAndPathsMap: Record<string, UniqueSpaceAndPathItems> = {};
  for (const item of list) {
    if (!uniqSpaceAndPathsMap.hasOwnProperty(`${item.spaceId}-${item.path}`)) {
      uniqSpaceAndPathsMap[`${item.spaceId}-${item.path}`] = { spaceId: item.spaceId, path: item.path, items: [] };
    }
  }

  for (const uniqSpaceAndPath of Object.values(uniqSpaceAndPathsMap)) {
    for (const item of list) {
      if (item.spaceId === uniqSpaceAndPath.spaceId && item.path === uniqSpaceAndPath.path) {
        uniqSpaceAndPath.items.push(item.key);
      }
    }
  }

  return Object.keys(uniqSpaceAndPathsMap).map(item => uniqSpaceAndPathsMap[item]);
}

/**
 * Helper to make sure path starts with a / and does not end with a /
 * @param path 
 */
export function formatPath(path: string): string {

  // if falsey/blank return just a slash
  if (!!!path) return '/';

  // if already a slash then return just that
  if (path === '/') return path;

  // must start with slash
  if (!/^\//.test(path)) {
    path = '/' + path;
  }

  // can't end with a slash
  path = path.replace(/\/$/, '');
  
  return path;
}

/**
 * Helper to concat elements together to form a path suitable for the backend
 * @param items path components
 */
export function joinPathParts(...items: string[]) {
  const path = [];
  for (const item of items) {
    path.push(item);
  }

  return path.join('/').replace(/[\/]+/g, '/').replace(/[\/+]$/, '');
}

/**
 * Helper to get the file from a path
 * @param pathString String containing the path and filename
 * @returns filename
 */
export function getPathFileName(pathString: string) {
  const pathParts = pathString.split('/');
  return pathParts[pathParts.length - 1];
}
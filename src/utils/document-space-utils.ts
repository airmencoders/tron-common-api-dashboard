import { DocumentDto } from "../openapi";

export enum CreateEditOperationType {
  NONE,
  CREATE_FOLDER,
  EDIT_FOLDERNAME,
  EDIT_FILENAME
}

export function getCreateEditTitle(type: CreateEditOperationType) {
  switch (type) {
    case CreateEditOperationType.CREATE_FOLDER:
      return "New Folder";
    case CreateEditOperationType.EDIT_FOLDERNAME:
      return "Edit Folder Name";
    case CreateEditOperationType.EDIT_FILENAME:
      return "Edit File Name";
    default:
      return "Unknown";
  }
}

function sortKeys(a: DocumentDto, b: DocumentDto): number {
  if (a.key.toLowerCase() < b.key.toLowerCase()) return 1;
  if (a.key.toLowerCase() === b.key.toLowerCase()) return 0;
  else return -1;
}

function sortDates(a: DocumentDto, b: DocumentDto): number {
  if (new Date(a.lastModifiedDate) < new Date(b.lastModifiedDate)) return 1;
  if (new Date(a.lastModifiedDate) === new Date(b.lastModifiedDate)) return 0;
  else return -1;
}

/**
   * Sorts from given criteria of the ag-grid (currently just 'key' and 'lastModifiedDate')
   * @param data Server data to sort client-side (since we're not using true infinite/paginated data currently)
   * @param sortModel sort model passed from ag-grid of shape ({ sort, colId })
   * @returns sorted data list of DocumentDto's
   */
export function applySortCriteria(
  data: DocumentDto[],
  sortModel: { sort: 'asc' | 'desc'; colId: 'key' | 'lastModifiedDate' }
): DocumentDto[] {

  let retVal: DocumentDto[] = [];
  let directories = data.filter(item => item.folder);
  let files = data.filter(item => !item.folder);

  // fall back on nothing else...
  if (sortModel === undefined) sortModel = { sort: 'desc', colId: 'key' };

  switch (sortModel.colId) {
    case 'key':
      directories = directories.sort(sortKeys);
      files = files.sort(sortKeys);
      retVal = [ ...files, ...directories ];
      break;
    case 'lastModifiedDate':
      directories = directories.sort(sortDates);
      files = files.sort(sortDates);
      retVal = [ ...files, ...directories ];
      break;
    default:
      break;        
  }    
  
  if (sortModel.sort == 'asc') retVal.reverse();
  return retVal;
}
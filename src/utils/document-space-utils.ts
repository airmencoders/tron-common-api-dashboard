import {
  DocumentDto,
  DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum,
  DocumentSpaceAppClientResponseDto,
  DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum,
  DocumentSpaceDashboardMemberResponseDto,
  DocumentSpacePrivilegeDtoTypeEnum,
} from '../openapi';
import { DocumentSpacePrivilegeNiceName } from '../state/document-space/memberships/document-space-privilege-nice-name';

export enum CreateEditOperationType {
  NONE,
  CREATE_FOLDER,
  EDIT_FOLDERNAME,
  EDIT_FILENAME,
}

export function getCreateEditTitle(type: CreateEditOperationType) {
  switch (type) {
    case CreateEditOperationType.CREATE_FOLDER:
      return 'New Folder';
    case CreateEditOperationType.EDIT_FOLDERNAME:
      return 'Edit Folder Name';
    case CreateEditOperationType.EDIT_FILENAME:
      return 'Edit File Name';
    default:
      return 'Unknown';
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
  let directories = data.filter((item) => item.folder);
  let files = data.filter((item) => !item.folder);

  // fall back on nothing else...
  if (sortModel === undefined) sortModel = { sort: 'desc', colId: 'key' };

  switch (sortModel.colId) {
    case 'key':
      directories = directories.sort(sortKeys);
      files = files.sort(sortKeys);
      retVal = [...files, ...directories];
      break;
    case 'lastModifiedDate':
      directories = directories.sort(sortDates);
      files = files.sort(sortDates);
      retVal = [...files, ...directories];
      break;
    default:
      break;
  }

  if (sortModel.sort == 'asc') retVal.reverse();
  return retVal;
}

// converts backend priv names to friendlier names for UI/users per mocks
export function resolvePrivName(
  privName: DocumentSpacePrivilegeDtoTypeEnum | DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum | string
): string {
  if (privName === DocumentSpacePrivilegeDtoTypeEnum.Membership) {
    return DocumentSpacePrivilegeNiceName.ADMIN;
  } else if (privName === DocumentSpacePrivilegeDtoTypeEnum.Write) {
    return DocumentSpacePrivilegeNiceName.EDITOR;
  } else {
    return DocumentSpacePrivilegeNiceName.VIEWER;
  }
}

// converts friendly priv names from the UI to the needed one(s) for the backend
//  it also gives any of the "free" implicit ones that come with a higher privilege (e.g. ADMIN gives EDITOR AND VIEWER)
export function unResolvePrivName(
  privilegeNiceName: DocumentSpacePrivilegeNiceName | string
): (DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum | DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum)[] {
  if (privilegeNiceName === DocumentSpacePrivilegeNiceName.ADMIN) {
    return [
      DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Membership,
      DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Write,
    ];
  } else if (privilegeNiceName === DocumentSpacePrivilegeNiceName.EDITOR) {
    return [DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Write];
  } else {
    return [];
  }
}

/**
 * Determines the most privileged privilege in a list of privileges
 * e.g. WRITE priv would result from a set containing [ READ, WRITE ]..
 * @param data
 * @returns the most privileged (highest) privilege
 */
 export function getHighestPriv(data: DocumentSpacePrivilegeDtoTypeEnum[]): string {
  if (!data) return '';

  if (data.find((item) => item === DocumentSpacePrivilegeDtoTypeEnum.Membership))
    return resolvePrivName(DocumentSpacePrivilegeDtoTypeEnum.Membership);
  else if (data.find((item) => item === DocumentSpacePrivilegeDtoTypeEnum.Write))
    return resolvePrivName(DocumentSpacePrivilegeDtoTypeEnum.Write);
  else return resolvePrivName(DocumentSpacePrivilegeDtoTypeEnum.Read);
}

// callback for the combobox renderer to decide what item is selected, go with highest priv if more than one..
export function getHighestPrivForMember(data: DocumentSpaceDashboardMemberResponseDto): string {
  if (!data) return '';
  return getHighestPriv(data.privileges.map((item) => item.type));
}

// callback for an appclient member's combobox renderer to decide what item is selected, go with highest priv if more than one..
export function getHighestPrivForAppClientMember(data: DocumentSpaceAppClientResponseDto): string {
  if (!data) return '';
  return getHighestPriv(data.privileges.map((item) => item.toUpperCase()) as DocumentSpacePrivilegeDtoTypeEnum[]);
}

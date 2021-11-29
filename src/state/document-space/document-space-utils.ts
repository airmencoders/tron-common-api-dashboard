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
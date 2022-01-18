import { createRef } from 'react';
import UploadMaterialIcon from '../../../../icons/UploadMaterialIcon';
import FileUpload from '../../FileUpload/FileUpload';
import Button from '../../../Button/Button';
import AddMaterialIcon from '../../../../icons/AddMaterialIcon';
import { clipBoardState, documentSpaceDownloadUrlService, useDocumentSpacePrivilegesState } from '../../../../state/document-space/document-space-state';
import { DocumentDto, DocumentSpacePrivilegeDtoTypeEnum } from '../../../../openapi';
import PeopleIcon2 from '../../../../icons/PeopleIcon2';
import DropDown from '../../../DropDown/DropDown';
import DownloadMaterialIcon from '../../../../icons/DownloadMaterialIcon';
import RemoveIcon from '../../../../icons/RemoveIcon';
import { ActionsProps } from '../ActionsProps';
import { CreateEditOperationType } from '../../../../state/document-space/document-space-utils';
import { useHookstate } from '@hookstate/core';
import { createTextToast } from '../../../Toast/ToastUtils/ToastUtils';
import { ToastType } from '../../../Toast/ToastUtils/toast-type';
import PasteIcon from '../../../../icons/PasteIcon';
import CutIcon from '../../../../icons/CutIcon';
import CopyContentIcon from '../../../../icons/CopyContentIcon';

/**
 * Helper to check a list of selected rows (DocumentDto objects) to see if we only have one
 * item in there, and if that's true, dont allow it to be downloaded if its BOTH (a folder AND its empty with no children)
 * @param selectedFiles list of user selected row(s)
 * @returns true if ok to proceed with download false otherwise
 */
export function checkIfItemsIsLoneEmptyFolder(selectedFiles: DocumentDto[]): boolean {
  if (!selectedFiles || selectedFiles.length === 0) return false; // shouldn't get here... but disallow

  if (selectedFiles.length > 1) return true;  // if we have multiple items - we dont care if one is empty
  else {
    if (selectedFiles[0].folder && !selectedFiles[0].hasContents) {
      createTextToast(ToastType.WARNING, 'Unable to download a folder with no contents')
      return false; // an empty folder - disallow download if it as it would be dubious otherwise
    }
    else return true;  // must have been a file or a folder with contents - allow
  }
}

function DesktopActions(props: ActionsProps) {
  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const downloadUrlService = documentSpaceDownloadUrlService();
  const uploadFileRef = createRef<HTMLInputElement>();
  const localClipboardState = useHookstate(clipBoardState);

  if (props.selectedSpace.value == null) {
    return null;
  }

  function openFileUpload(mode: 'file' | 'folder') {
    if (uploadFileRef.current) {
      (uploadFileRef.current as any).webkitdirectory = mode === 'folder';
    }

    uploadFileRef.current?.click();
  }

  return (
      <div className={`document-space-actions document-space-actions--desktop ${props.className ?? ''} `}>
        {documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Write) &&
        <>
          <Button
              type="button"
              icon
              disabled={props.selectedFiles.length === 0}
              data-testid="copy-items-button"
              disableMobileFullWidth
              onClick={() => props.documentPageService.copySelectedItems()}
          >
            <CopyContentIcon className="icon-color" fillColor='white' size={1}/>
          </Button>
          <Button
              type="button"
              icon
              disabled={props.selectedFiles.length === 0}
              data-testid="cut-items-button"
              disableMobileFullWidth
              onClick={() => props.documentPageService.cutSelectedItems()}
          >
            <CutIcon className="icon-color" fillColor='white' size={1}/>
          </Button>
          <Button
              type="button"
              icon
              disabled={!(localClipboardState.value && localClipboardState.value.items)}
              data-testid="paste-items-button"
              disableMobileFullWidth
              onClick={() => props.documentPageService.pasteItems()}
          >
            <PasteIcon className="icon-color" fillColor='white' size={1}/>
          </Button>
          <div data-testid="upload-new-file">
            <FileUpload
                ref={uploadFileRef}
                documentSpaceId={props.selectedSpace.value.id}
                currentPath={props.path.value}
                onFinish={() => props.shouldUpdateDatasource.set(true)}
            />
            <DropDown
              id="upload-items"
              data-testid="upload-items"
              anchorContent={<UploadMaterialIcon size={1} fill iconTitle="Upload File(s)"/>}
              items={[
                {
                  displayName: 'Upload File(s)',
                  action: () => openFileUpload('file')
                },
                {
                  displayName: 'Upload Folder',
                  action: () => openFileUpload('folder')
                }
              ]}
            />
          </div>
        </>
        }
        {documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Read) && (
            <DropDown
                id="download-items"
                data-testid="download-items"
                anchorContent={<DownloadMaterialIcon size={1} fill iconTitle="Download Items"/>}
                items={[
                  {
                    displayName: 'Download Selected',
                    action: () => {
                      if (props.selectedFiles.value.length > 0 && props.selectedSpace.value && checkIfItemsIsLoneEmptyFolder(props.selectedFiles.value)) {
                        window.open(downloadUrlService.createRelativeFilesDownloadUrl(
                        props.selectedSpace.value.id,
                        props.path.value,
                        props.selectedFiles.value));
                      }
                    }
                  },
                  {
                    displayName: 'Download All Files (zip)',
                    action: () => props.selectedSpace.value && window.open(downloadUrlService.createRelativeDownloadAllFilesUrl(
                        props.selectedSpace.value.id))
                  }
                ]}
            />
        )}
        {documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Write) &&
        <>
          <DropDown
              id="add-new-items"
              data-testid="add-new-items"
              anchorContent={<AddMaterialIcon fill size={1} iconTitle="Add Items"/>}
              items={[
                {
                  displayName: 'Add New Folder',
                  action: () => props.createEditElementOpType.set(CreateEditOperationType.CREATE_FOLDER)
                }
              ]}
          />

          <Button
              type="button"
              icon
              disabled={props.selectedFiles.value.length === 0}
              data-testid="delete-selected-items"
              disableMobileFullWidth
              onClick={() => props.showDeleteSelectedDialog.set(true)}
          >
            <RemoveIcon className="icon-color" size={1}/>
          </Button>
        </>
        }


        {documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Membership) && (
            <Button
                type="button"
                icon
                disableMobileFullWidth
                onClick={() => props.membershipsState.isOpen.set(true)}
            >
              <PeopleIcon2 size={1} iconTitle="Manage Users"/>
            </Button>
        )}
      </div>
  );
}

export default DesktopActions;
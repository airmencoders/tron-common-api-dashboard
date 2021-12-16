import { createRef } from 'react';
import UploadMaterialIcon from '../../../../icons/UploadMaterialIcon';
import FileUpload from '../../FileUpload/FileUpload';
import Button from '../../../Button/Button';
import AddMaterialIcon from '../../../../icons/AddMaterialIcon';
import { documentSpaceDownloadUrlService, useDocumentSpacePrivilegesState } from '../../../../state/document-space/document-space-state';
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

export function checkIfItemsIsLoneEmptyFolder(selectedFiles: DocumentDto[]): boolean {
  if (!selectedFiles || selectedFiles.length === 0) return false;

  if (selectedFiles.length > 1) return true;  // we dont care if we multiple items whether or not one of them is empty
  else {
    if (selectedFiles[0].folder && !selectedFiles[0].hasContents) {
      createTextToast(ToastType.WARNING, 'Unable to download a folder with no contents')
      return false; // an empty folder
    }
    else return true;
  }
}

function DesktopActions(props: ActionsProps) {
  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const downloadUrlService = documentSpaceDownloadUrlService();
  const uploadFileRef = createRef<HTMLInputElement>();

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
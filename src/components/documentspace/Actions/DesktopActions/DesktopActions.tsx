import { createRef } from 'react';
import UploadMaterialIcon from '../../../../icons/UploadMaterialIcon';
import FileUpload from '../../FileUpload/FileUpload';
import Button from '../../../Button/Button';
import AddMaterialIcon from '../../../../icons/AddMaterialIcon';
import { documentSpaceDownloadUrlService, useDocumentSpacePrivilegesState } from '../../../../state/document-space/document-space-state';
import { DocumentSpacePrivilegeDtoTypeEnum } from '../../../../openapi';
import PeopleIcon2 from '../../../../icons/PeopleIcon2';
import DropDown from '../../../DropDown/DropDown';
import DownloadMaterialIcon from '../../../../icons/DownloadMaterialIcon';
import RemoveIcon from '../../../../icons/RemoveIcon';
import { ActionsProps } from '../ActionsProps';
import { CreateEditOperationType } from '../../../../state/document-space/document-space-utils';

function DesktopActions(props: ActionsProps) {
  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const downloadUrlService = documentSpaceDownloadUrlService();

  const uploadFileRef = createRef<HTMLInputElement>();

  if (props.selectedSpace.value == null) {
    return null;
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
                onFinish={() => props.shouldUpdateInfiniteCache.set(true)}
            />
            <Button
                data-testid="upload-file__btn"
                onClick={() => uploadFileRef.current?.click()}
                type="button"
                icon
            >
              <UploadMaterialIcon size={1} fill iconTitle="Upload Files"/>
            </Button>
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
                    action: () => window.open((props.selectedFiles.value.length > 0 && props.selectedSpace.value)
                        ? downloadUrlService.createRelativeFilesDownloadUrl(
                            props.selectedSpace.value.id,
                            props.path.value,
                            props.selectedFiles.value
                        )
                        : undefined)
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
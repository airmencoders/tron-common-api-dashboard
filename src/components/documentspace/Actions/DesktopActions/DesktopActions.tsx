import { createRef } from 'react';
import UploadMaterialIcon from '../../../../icons/UploadMaterialIcon';
import FileUpload from '../../FileUpload/FileUpload';
import Button from '../../../Button/Button';
import AddMaterialIcon from '../../../../icons/AddMaterialIcon';
import { DesktopActionsProps } from './DesktopActionsProps';
import { useDocumentSpacePrivilegesState, useDocumentSpaceState } from '../../../../state/document-space/document-space-state';
import { DocumentSpacePrivilegeDtoTypeEnum } from '../../../../openapi';
import PeopleIcon2 from '../../../../icons/PeopleIcon2';
import DropDown from '../../../DropDown/DropDown';
import DownloadMaterialIcon from '../../../../icons/DownloadMaterialIcon';
import RemoveIcon from '../../../../icons/RemoveIcon';

function DesktopActions(props: DesktopActionsProps) {
  const documentSpaceService = useDocumentSpaceState();
  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();

  const uploadFileRef = createRef<HTMLInputElement>();

  if (props.selectedSpace.value == null) {
    return null;
  }

  return (
    <>
      {documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Write) &&
        <>
          <div data-testid="upload-new-file">
            <FileUpload
              ref={uploadFileRef}
              documentSpaceId={props.selectedSpace.value.id}
              currentPath={props.path.value}
              onFinish={() => props.shouldUpdateDatasource.set(true)}
            />
            <Button
              data-testid="upload-file__btn"
              onClick={() => uploadFileRef.current?.click()}
              type="button"
              icon
              className="rotate-icon"
            >
              <UploadMaterialIcon size={1} fill iconTitle="Upload Files" />
            </Button>
          </div>

          <DropDown
            id="add-new-items"
            data-testid="add-new-items"
            anchorContent={<AddMaterialIcon fill size={1} iconTitle="Add Items" />}
            items={[
              { displayName: 'Add New Folder', action: () => props.newFolderPrompt.set(true) }
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
            <RemoveIcon className="icon-color" size={1} />
          </Button>
        </>
      }

      {documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Read) && (
        <DropDown
          id="download-items"
          data-testid="download-items"
          anchorContent={<DownloadMaterialIcon size={1} fill iconTitle="Download Items" />}
          items={[
            {
              displayName: 'Download Selected',
              action: () => window.open((props.selectedFiles.value.length > 0 && props.selectedSpace.value)
                ? documentSpaceService.createRelativeFilesDownloadUrl(
                  props.selectedSpace.value.id,
                  props.path.value,
                  props.selectedFiles.value
                )
                : undefined)
            },
            {
              displayName: 'Download All Files (zip)',
              action: () => props.selectedSpace.value && window.open(documentSpaceService.createRelativeDownloadAllFilesUrl(
                props.selectedSpace.value.id))
            }
          ]}
        />
      )}

      {documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Membership) && (
        <Button
          type="button"
          unstyled
          disableMobileFullWidth
          onClick={() => props.membershipsState.isOpen.set(true)}
        >
          <PeopleIcon2 size={1.5} iconTitle="Manage Users" />
        </Button>
      )}
    </>
  );
}

export default DesktopActions;
import { useHookstate } from '@hookstate/core';
import { createRef } from 'react';
import { Popup } from 'semantic-ui-react';
import EllipsesIcon from '../../../../icons/EllipsesIcon';
import UploadMaterialIcon from '../../../../icons/UploadMaterialIcon';
import FileUpload from '../../FileUpload/FileUpload';
import Button from '../../../Button/Button';
import AddMaterialIcon from '../../../../icons/AddMaterialIcon';
import PeopleIcon from '../../../../icons/PeopleIcon';
import { ActionsProps } from '../ActionsProps';
import { useDocumentSpacePrivilegesState, useDocumentSpaceState } from '../../../../state/document-space/document-space-state';
import { DocumentSpacePrivilegeDtoTypeEnum } from '../../../../openapi';
import DropDown from '../../../DropDown/DropDown';
import DownloadMaterialIcon from '../../../../icons/DownloadMaterialIcon';
import RemoveIcon from '../../../../icons/RemoveIcon';
import { CreateEditOperationType } from '../../../../state/document-space/document-space-utils';

interface MoreActionsState {
  popupOpen: boolean;
}

function MobileActions(props: ActionsProps) {
  const state = useHookstate<MoreActionsState>({
    popupOpen: false
  });

  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const documentSpaceService = useDocumentSpaceState();

  const uploadFileRef = createRef<HTMLInputElement>();

  if (props.selectedSpace.value == null) {
    return null;
  }

  function closePopupWithAction(action: () => void) {
    action();
    state.popupOpen.set(false);
  }

  function getEllipsisContent() {
    if (props.selectedSpace.value == null ||
      !documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Write) &&
      !documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Membership)) {
      return null;
    }

    return (
      <Popup
        trigger={
          <div className="document-space-actions__icon" data-testid="document-space-actions">
            <Button
              type="button"
            >
              <EllipsesIcon fill size={1} iconTitle="Actions" />
            </Button>
          </div>
        }
        on="click"
        position="bottom right"
        className={"document-space-actions__popper document-space-popup-actions"}
        open={state.popupOpen.value}
        onOpen={() => state.popupOpen.set(true)}
        onClose={() => state.popupOpen.set(false)}
      >
        <Popup.Content>
          {documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Write) &&
            <>
              <div className="popper__item" onClick={() => closePopupWithAction(() => uploadFileRef.current?.click())}>
                <UploadMaterialIcon style="primary" fill className="popper__icon item__icon" size={1} iconTitle="Upload File" />
                <span className="popper__title item__title">Upload File</span>
              </div>

              <div className="popper__item" onClick={() => closePopupWithAction(() => props.createEditElementOpType.set(CreateEditOperationType.CREATE_FOLDER))}>
                <AddMaterialIcon style="primary" fill className="popper__icon" size={1} iconTitle="Add Items" />
                <span className="popper__title item__title">New Folder</span>
              </div>
            </>
          }

          {documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Membership) &&
            <div className="popper__item" onClick={() => closePopupWithAction(() => props.membershipsState.isOpen.set(true))}>
              <PeopleIcon style="primary" size={1} iconTitle="Manage Users" />
              <span className="popper__title item__title">Manage Users</span>
            </div>
          }
        </Popup.Content>
      </Popup>
    );
  }

  return (
    <div className={`document-space-actions document-space-actions--mobile ${props.className ?? ''} `}>
      {getEllipsisContent()}

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

      {documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Write) && 
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
      }

      <FileUpload
        ref={uploadFileRef}
        currentPath={props.path.value}
        documentSpaceId={props.selectedSpace.value.id}
        onFinish={() => props.shouldUpdateDatasource.set(true)}
      />
    </div>
  );
}

export default MobileActions;
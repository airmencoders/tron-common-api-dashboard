import { useHookstate } from '@hookstate/core';
import { createRef } from 'react';
import { Popup } from 'semantic-ui-react';
import AddMaterialIcon from '../../../../icons/AddMaterialIcon';
import CopyContentIcon from '../../../../icons/CopyContentIcon';
import CutIcon from '../../../../icons/CutIcon';
import DownloadMaterialIcon from '../../../../icons/DownloadMaterialIcon';
import EllipsesIcon from '../../../../icons/EllipsesIcon';
import PasteIcon from '../../../../icons/PasteIcon';
import PeopleIcon from '../../../../icons/PeopleIcon';
import RemoveIcon from '../../../../icons/RemoveIcon';
import UploadMaterialIcon from '../../../../icons/UploadMaterialIcon';
import { DocumentSpacePrivilegeDtoTypeEnum } from '../../../../openapi';
import { clipBoardState, ClipBoardState, documentSpaceDownloadUrlService, useDocumentSpacePrivilegesState } from '../../../../state/document-space/document-space-state';
import { CreateEditOperationType } from '../../../../state/document-space/document-space-utils';
import Button from '../../../Button/Button';
import DropDown from '../../../DropDown/DropDown';
import FileUpload from '../../FileUpload/FileUpload';
import { ActionsProps } from '../ActionsProps';
import { checkIfItemsIsLoneEmptyFolder } from '../DesktopActions/DesktopActions';

interface MoreActionsState {
  popupOpen: boolean;
}

function MobileActions(props: ActionsProps) {
  const state = useHookstate<MoreActionsState>({
    popupOpen: false
  });

  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const downloadUrlService = documentSpaceDownloadUrlService();
  const localClipboardState = useHookstate(clipBoardState);
  const uploadFileRef = createRef<HTMLInputElement>();

  if (props.selectedSpace.value == null) {
    return null;
  }

  function closePopupWithAction(action: () => void) {
    action();
    state.popupOpen.set(false);
  }

  function openFileUpload(mode: 'file' | 'folder') {
    if (mode === 'folder' && !(/Chrome|Firefox/i.test(navigator.userAgent))) {
      alert('Folder upload only supported in Chromium-based browsers or Firefox');
      return;
    }

    if (uploadFileRef.current) {
      (uploadFileRef.current as any).webkitdirectory = mode === 'folder';
    }

    uploadFileRef.current?.click();
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
              <div className="popper__item" onClick={() => closePopupWithAction(() => openFileUpload('file'))}>
                <UploadMaterialIcon style="primary" fill className="popper__icon item__icon" size={1} iconTitle="Upload File(s)" />
                <span className="popper__title item__title">Upload File(s)</span>
              </div>

              <div className="popper__item" onClick={() => closePopupWithAction(() => openFileUpload('folder'))}>
                <UploadMaterialIcon style="primary" fill className="popper__icon item__icon" size={1} iconTitle="Upload Folder" />
                <span className="popper__title item__title">Upload Folder</span>
              </div>

              <div className="popper__item" onClick={() => closePopupWithAction(() => props.createEditElementOpType.set(CreateEditOperationType.CREATE_FOLDER))}>
                <AddMaterialIcon style="primary" fill className="popper__icon" size={1} iconTitle="Add Items" />
                <span className="popper__title item__title">New Folder</span>
              </div>

              <div className="popper__item" onClick={() => closePopupWithAction(() => {props.documentPageService.cutSelectedItems()})}>
                <CutIcon style="primary" className="popper__icon" size={1} iconTitle="Cut Items" />
                <span className="popper__title item__title">Cut Items</span>
              </div>

              <div className="popper__item" onClick={() => closePopupWithAction(() => {props.documentPageService.copySelectedItems()})}>
                <CopyContentIcon style="primary" className="popper__icon" size={1} iconTitle="Copy Items" />
                <span className="popper__title item__title">Copy Items</span>
              </div>

              { localClipboardState.value && localClipboardState.value.items &&
                <div className="popper__item" onClick={() => closePopupWithAction(() => {props.documentPageService.pasteItems()})}>
                  <PasteIcon style="primary" className="popper__icon" size={1} iconTitle="Paste Items" />
                  <span className="popper__title item__title">Paste Items</span>
                </div>
              }
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
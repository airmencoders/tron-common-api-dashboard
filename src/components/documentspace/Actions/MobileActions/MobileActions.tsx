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
import { useDocumentSpacePrivilegesState } from '../../../../state/document-space/document-space-state';
import { DocumentSpacePrivilegeDtoTypeEnum } from '../../../../openapi';

interface MoreActionsState {
  popupOpen: boolean;
}

function MobileActions(props: ActionsProps) {
  const state = useHookstate<MoreActionsState>({
    popupOpen: false
  });

  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();

  const uploadFileRef = createRef<HTMLInputElement>();

  if (props.selectedSpace.value == null) {
    return null;
  }

  function closePopupWithAction(action: () => void) {
    action();
    state.popupOpen.set(false);
  }

  /**
   * Menu for mobile only contains Write and Membership related actions.
   * So, don't render anything if the user does not have access to anything.
   */
  if (!documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Write) &&
    !documentSpacePrivilegesService.isAuthorizedForAction(props.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Membership)) {
    return null;
  }

  return (
    <div className="document-space-actions">
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
        className={"document-space-actions__popper"}
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

              <div className="popper__item" onClick={() => closePopupWithAction(() => props.newFolderPrompt.set(true))}>
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
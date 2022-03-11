import { useHookstate } from '@hookstate/core';
import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import { Tab } from 'semantic-ui-react';
import Button from '../../components/Button/Button';
import ArchiveDialog from '../../components/documentspace/ArchiveDialog/ArchiveDialog';
import SpaceNotFoundDialog from "../../components/documentspace/SpaceNotFoundDialog/SpaceNotFoundDialog";
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import InfoNotice from '../../components/InfoNotice/InfoNotice';
import PageFormat from '../../components/PageFormat/PageFormat';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import TabBar from '../../components/TabBar/TabBar';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import AddMaterialIcon from '../../icons/AddMaterialIcon';
import UserIcon from "../../icons/UserIcon";
import UserIconCircle from "../../icons/UserIconCircle";
import {
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceRequestDto
} from '../../openapi';
import { useAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { FormActionType } from '../../state/crud-page/form-action-type';
import {
  clipBoardState, useDocumentSpacePageState,
  useDocumentSpacePrivilegesState,
  useDocumentSpaceState
} from '../../state/document-space/document-space-state';
import { CreateEditOperationType, getCreateEditTitle } from '../../utils/document-space-utils';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import MyFilesAndFolders from './DocSpacePageComponents/MyFilesAndFolders';
import RecentSpaceActivity from './DocSpacePageComponents/RecentSpaceActivity';
import SearchSpace from './DocSpacePageComponents/SearchSpace';
import DocumentSpaceCreateEditForm from './DocumentSpaceCreateEditForm';
import DocumentSpaceEditForm from './DocumentSpaceEditForm';
import DocumentSpaceMySettingsForm from "./DocumentSpaceMySettingsForm";
import './DocumentSpacePage.scss';
import DocumentSpaceSelector from "./DocumentSpaceSelector";
import FolderSizeDialog from './FolderSizeDialog';
import DocumentSpaceMemberships from './Memberships/DocumentSpaceMemberships';

function DocumentSpacePage() {
  const location = useLocation();
  const history = useHistory();
  const localClipboardState = useHookstate(clipBoardState);
  const mountedRef = useRef(false);
  const pageService = useDocumentSpacePageState(mountedRef);  
  const documentSpaceService = useDocumentSpaceState();
  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const authorizedUserService = useAuthorizedUserState();
  const isAdmin = pageService.isAdmin();

  async function fetchSpaces() {
    try {
      await pageService.loadDocumentSpaces();
    } catch (err) {
      createTextToast(ToastType.ERROR, 'Could not load Document Spaces');
      return;
    }
  }

  async function loadSpaceOnInit() {
    await fetchSpaces();

    // Check if navigating to an existing document space first
    if (pageService.locationIncludesDocumentSpace(location.search)) {
      pageService.loadDocSpaceFromLocation(location.search, ()=> pageService.state.spaceNotFound.set(true));
      return;
    }

    loadDefaultSpace();
  }

  async function loadSpaceOnDeletion() {
    await fetchSpaces();
    loadDefaultSpace();
  }

  function loadDefaultSpace() {
    // Load in a default space if no existing
    const selectedSpace = pageService.getInitialDocumentSpace();

    if (selectedSpace == null) {
      pageService.spacesState.selectedSpace.set(undefined);
      createTextToast(ToastType.ERROR, 'You do not have access to any Document Spaces');
      return;
    }

    const queryParams = pageService.getUrlParametersForSpaceAndPath(selectedSpace.id);
    history.replace({ search: queryParams.toString() });
  }

  useEffect(() => {
    mountedRef.current = true;
    loadSpaceOnInit();

    return function cleanup() {
      mountedRef.current = false;
      pageService.resetState();
    };
  }, []);

  useEffect(() => {
    pageService.loadDocSpaceFromLocation(location.search, () => pageService.state.spaceNotFound.set(true));
  }, [location.search]);

  async function handleDocumentSpaceCreation(space: DocumentSpaceRequestDto) {
    try {
      const createdSpace = await pageService.submitDocumentSpace(space);

      const queryParams = pageService.getUrlParametersForSpaceAndPath(createdSpace.id);
      history.push({ search: queryParams.toString() });
    } catch (error) {
      createTextToast(ToastType.ERROR, prepareRequestError(error).message);
    }
  }

  const isDocumentSpacesLoading = documentSpaceService.isDocumentSpacesStatePromised;
  const isDocumentSpacesErrored = documentSpaceService.isDocumentSpacesStateErrored;

  return (
    <PageFormat pageTitle="Document Space" className="document-space-page">
      {localClipboardState.value && localClipboardState.value.items && localClipboardState.value.items.length > 0 ? (
        <div className="clipboard-notification">
          <InfoNotice type={'success'} slim={true}>
            {`${localClipboardState.value.items.length} items on clipboard`}&nbsp;
            <Button
              data-testid="clear-clipboard-button"
              unstyled
              type={'button'}
              onClick={() => localClipboardState.set(undefined)}
            >
              Clear
            </Button>
          </InfoNotice>
        </div>
      ) : null}
      <FormGroup
        labelName="document-space"
        labelText="Spaces"
        isError={false}
        className="document-space-page__space-select"
      >
        <div className="add-space-container">
          <div>
            <DocumentSpaceSelector
              isDocumentSpacesLoading={isDocumentSpacesLoading}
              isDocumentSpacesErrored={isDocumentSpacesErrored}
              documentSpaceService={documentSpaceService}
              selectedSpace={pageService.state.selectedSpace?.value}
              onUnreachableSpace={pageService.state.spaceNotFound.value || pageService.state.showNoChosenSpace.value}
            />
            {isAdmin && !documentSpacePrivilegesService.isPromised && (
              <Button
                data-testid="add-doc-space__btn"
                type="button"
                onClick={() => pageService.state.merge({ drawerOpen: true })}
                disabled={isDocumentSpacesLoading || isDocumentSpacesErrored}
              >
                Add New Space <AddMaterialIcon fill size={1} />
              </Button>
            )}

            {documentSpaceService.documentSpaces.length > 0 &&
              !(pageService.state.showNoChosenSpace.value || pageService.state.spaceNotFound.value) && (
                <Button
                  className="document-space-page__space-user-settings"
                  data-testid="doc-space-my-settings__btn"
                  type="button"
                  unstyled
                  disableMobileFullWidth
                  onClick={() => pageService.state.isDefaultDocumentSpaceSettingsOpen.set(true)}
                >
                  <UserIcon size={0} />
                </Button>
              )}
          </div>
        </div>
      </FormGroup>
      <Tab
        panes={[
          {
            menuItem: 'Browse',
            render: () => <MyFilesAndFolders pageService={pageService} />,
          },
          {
            menuItem: "Recent Activity",
            render: () => <RecentSpaceActivity pageService={pageService} />,
          },
          {
            menuItem: "Search",
            render: () => <SearchSpace pageService={pageService} />,
          }
        ]}
      />

      <SpaceNotFoundDialog
        shouldShow={pageService.state.spaceNotFound.value}
        onHide={() => {
          pageService.state.spaceNotFound.set(false);
          pageService.state.showNoChosenSpace.set(true); // force user to user space drop down
        }}
      />

      <SideDrawer
        isLoading={false}
        title="Add New Document Space"
        isOpen={pageService.state.drawerOpen.get()}
        onCloseHandler={pageService.closeDrawer.bind(pageService)}
        size={pageService.state.sideDrawerSize.get()}
      >
        {pageService.state.drawerOpen.get() && (
          <DocumentSpaceEditForm
            onCancel={pageService.closeDrawer.bind(pageService)}
            onSubmit={handleDocumentSpaceCreation}
            isFormSubmitting={pageService.state.isSubmitting.get()}
            formActionType={FormActionType.ADD}
            onCloseErrorMsg={pageService.closeErrorMsg.bind(pageService)}
            showErrorMessage={pageService.state.showErrorMessage.get()}
            errorMessage={pageService.state.errorMessage.get()}
          />
        )}
      </SideDrawer>

      <SideDrawer
        isLoading={false}
        title={getCreateEditTitle(pageService.state.createEditElementOpType.get())}
        isOpen={pageService.state.createEditElementOpType.get() !== CreateEditOperationType.NONE}
        onCloseHandler={() => pageService.mergeState({ createEditElementOpType: CreateEditOperationType.NONE })}
        size={pageService.state.sideDrawerSize.get()}
      >
        {pageService.state.createEditElementOpType.get() !== CreateEditOperationType.NONE && (
          <DocumentSpaceCreateEditForm
            onCancel={() =>
              pageService.mergeState({
                showErrorMessage: false,
                createEditElementOpType: CreateEditOperationType.NONE,
                selectedFile: undefined,
              })
            }
            onSubmit={pageService.submitElementName.bind(pageService)}
            isFormSubmitting={pageService.state.isSubmitting.get()}
            onCloseErrorMsg={pageService.closeErrorMsg.bind(pageService)}
            showErrorMessage={pageService.state.showErrorMessage.get()}
            errorMessage={pageService.state.errorMessage.get()}
            elementName={pageService.state.selectedFile.value?.key}
            opType={pageService.state.createEditElementOpType.get()}
          />
        )}
      </SideDrawer>

      {pageService.state.showNoChosenSpace.value || pageService.state.spaceNotFound.value ? null : (
        <SideDrawer
          isLoading={false}
          title="My Settings"
          isOpen={pageService.state.isDefaultDocumentSpaceSettingsOpen.get()}
          onCloseHandler={pageService.closeMySettingsDrawer.bind(pageService)}
          size={pageService.state.sideDrawerSize.get()}
          titleStyle={{ color: '#5F96EA', marginTop: -2 }}
          preTitleNode={
            <div style={{ padding: '4px 4px 4px 4px', border: '1px solid #E5E5E5', borderRadius: 4, marginRight: 14 }}>
              <UserIconCircle size={0} />
            </div>
          }
        >
          <DocumentSpaceMySettingsForm
            onCancel={pageService.closeMySettingsDrawer.bind(pageService)}
            onSubmit={pageService.submitDefaultDocumentSpace.bind(pageService)}
            isFormSubmitting={pageService.state.isSubmitting.get()}
            formActionType={FormActionType.SAVE}
            documentSpaces={documentSpaceService.documentSpacesState}
            authorizedUserService={authorizedUserService}
            onDocumentSpaceDeleted={loadSpaceOnDeletion}
          />
        </SideDrawer>
      )}

      <ArchiveDialog
        show={pageService.state.showDeleteDialog.get()}
        onCancel={pageService.closeRemoveDialog.bind(pageService)}
        onSubmit={pageService.archiveFile.bind(pageService, true)}
        items={pageService.state.selectedFile.value}
      />

      <ArchiveDialog
        show={pageService.state.showDeleteSelectedDialog.get()}
        onCancel={pageService.closeRemoveDialog.bind(pageService)}
        onSubmit={pageService.archiveFile.bind(pageService, false)}
        items={pageService.state.selectedFiles.value}
      />

      {pageService.state.selectedItemForSize && pageService.state.showFolderSizeDialog.get() && (
        <FolderSizeDialog
          show={pageService.state.showFolderSizeDialog.get()}
          onClose={() => pageService.mergeState({ selectedItemForSize: undefined, showFolderSizeDialog: false })}
          spaceId={pageService.state.selectedItemForSize.get()!.spaceId}
          folderPath={(
            pageService.state.selectedItemForSize.get()!.path +
            '/' +
            pageService.state.selectedItemForSize.get()!.key
          ).replace(/[\/]+/g, '/')}
        />
      )}

      {pageService.state.selectedSpace.value &&
        !documentSpacePrivilegesService.isPromised &&
        documentSpacePrivilegesService.isAuthorizedForAction(
          pageService.state.selectedSpace.value.id,
          DocumentSpacePrivilegeDtoTypeEnum.Membership
        ) && (
          <DocumentSpaceMemberships
            documentSpaceId={pageService.state.selectedSpace.value.id}
            isOpen={pageService.state.membershipsState.isOpen.value}
            onSubmit={() => pageService.state.membershipsState.isOpen.set(false)}
            onCloseHandler={() => pageService.state.membershipsState.isOpen.set(false)}
          />
        )}
    </PageFormat>
  );
}

export default DocumentSpacePage;

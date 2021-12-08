import { Downgraded, none, State, useHookstate } from '@hookstate/core';
import { ValueFormatterParams } from 'ag-grid-community';
import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import BreadCrumbTrail from '../../components/BreadCrumbTrail/BreadCrumbTrail';
import Button from '../../components/Button/Button';
import DocSpaceItemRenderer from '../../components/DocSpaceItemRenderer/DocSpaceItemRenderer';
import DocumentRowActionCellRenderer, { PopupMenuItem } from '../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import DocumentSpaceActions from '../../components/documentspace/Actions/DocumentSpaceActions';
import ArchiveDialog from '../../components/documentspace/ArchiveDialog/ArchiveDialog';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import FullPageInfiniteGrid from "../../components/Grid/FullPageInifiniteGrid/FullPageInfiniteGrid";
import GridColumn from '../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import PageFormat from '../../components/PageFormat/PageFormat';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { DeviceSize, useDeviceInfo } from '../../hooks/PageResizeHook';
import AddMaterialIcon from '../../icons/AddMaterialIcon';
import CircleMinusIcon from '../../icons/CircleMinusIcon';
import DownloadMaterialIcon from '../../icons/DownloadMaterialIcon';
import EditIcon from '../../icons/EditIcon';
import StarHollowIcon from '../../icons/StarHollowIcon';
import StarIcon from '../../icons/StarIcon';
import UserIcon from "../../icons/UserIcon";
import UserIconCircle from "../../icons/UserIconCircle";
import {
  DocumentDto,
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceRequestDto,
} from '../../openapi';
import { useAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { documentSpaceDownloadUrlService, useDocumentSpacePageState, useDocumentSpacePrivilegesState, useDocumentSpaceState } from '../../state/document-space/document-space-state';
import { CreateEditOperationType, getCreateEditTitle } from '../../state/document-space/document-space-utils';
import { formatDocumentSpaceDate } from '../../utils/date-utils';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { formatBytesToString } from '../../utils/file-utils';
import DocumentDownloadCellRenderer from './DocumentDownloadCellRenderer';
import DocumentSpaceCreateEditForm from './DocumentSpaceCreateEditForm';
import DocumentSpaceEditForm from './DocumentSpaceEditForm';
import DocumentSpaceMySettingsForm from "./DocumentSpaceMySettingsForm";
import './DocumentSpacePage.scss';
import DocumentSpaceSelector, { pathQueryKey, spaceIdQueryKey } from "./DocumentSpaceSelector";
import DocumentSpaceMemberships from './Memberships/DocumentSpaceMemberships';

function DocumentSpacePage() {
  const location = useLocation();
  const history = useHistory();

  const mountedRef = useRef(false);

  const pageService = useDocumentSpacePageState(mountedRef);
  const documentSpaceService = useDocumentSpaceState();
  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const downloadUrlService = documentSpaceDownloadUrlService();
  const authorizedUserService = useAuthorizedUserState();

  const isAdmin = pageService.isAdmin();

  const deviceInfo = useDeviceInfo();

  const documentDtoColumns = useHookstate<GridColumn[]>([
    new GridColumn({
      field: 'key',
      headerName: 'Name',
      resizable: true,
      sortable: true,
      sort: 'asc',
      sortingOrder: ['asc', 'desc'],
      cellRenderer: DocSpaceItemRenderer,
      checkboxSelection: true,
      initialWidth: 400,
      cellRendererParams: {
        onClick: (folder: string) => {
          const newPath = pageService.state.get().path + '/' + folder;
          const queryParams = new URLSearchParams(location.search);
          queryParams.set(spaceIdQueryKey, pageService.state.get().selectedSpace?.id ?? '');
          queryParams.set(pathQueryKey, newPath);
          history.push({ search: queryParams.toString() });
        },
        isFavorited: (document: DocumentDto) => {
          return pageService.getFavoritesShouldShow.bind(pageService, document, false)();
        }
      }
    }),
    new GridColumn({
      field: 'lastModifiedDate',
      headerName: 'Last Modified',
      sortable: true,
      sortingOrder: ['asc', 'desc'],
      resizable: true,
      initialWidth: 250,
      valueFormatter: function (params: ValueFormatterParams) {
        if (params.value) {
          return formatDocumentSpaceDate(params.value);
        }
      }
    }),
    new GridColumn({
      field: 'lastModifiedBy',
      headerName: 'Last Modified By',
      resizable: true,
    }),
    new GridColumn({
      field: 'size',
      headerName: 'Size',
      resizable: true,
      valueFormatter: function (params: ValueFormatterParams) {
        if (params.value != null) {
          return params.value ? formatBytesToString(params.value) : '';
        }
      }
    }),
    new GridColumn({
      valueGetter: GridColumn.defaultValueGetter,
      headerName: 'Download',
      headerClass: 'header-center',
      resizable: true,
      cellRenderer: DocumentDownloadCellRenderer
    }),
    new GridColumn({
      valueGetter: GridColumn.defaultValueGetter,
      headerName: 'More',
      headerClass: 'header-center',
      cellRenderer: DocumentRowActionCellRenderer,
      cellRendererParams: {
        menuItems: [
          { 
            title: 'Add to favorites', 
            icon: StarIcon, 
            shouldShow: (doc: DocumentDto) => pageService.getFavoritesShouldShow.bind(pageService, doc, true)(),
            isAuthorized: () => true,
            onClick: pageService.addToFavorites.bind(pageService),
          },
          {
            title: 'Remove from favorites',
            icon: StarHollowIcon,
            iconProps: {
              size: 1.1
            },
            shouldShow: (doc: DocumentDto) => pageService.getFavoritesShouldShow.bind(pageService, doc, false)(),
            isAuthorized: () => true,
            onClick: pageService.removeFromFavorites.bind(pageService),
          },
          {
            title: 'Remove',
            icon: CircleMinusIcon,
            isAuthorized: (doc: DocumentDto) => doc != null && documentSpacePrivilegesService.isAuthorizedForAction(doc.spaceId, DocumentSpacePrivilegeDtoTypeEnum.Write),
            onClick: (doc: DocumentDto) => pageService.mergeState({ selectedFile: doc, showDeleteDialog: true }),
          },
          { 
            title: 'Rename Folder', 
            icon: EditIcon, 
            shouldShow: (doc: DocumentDto) => doc && doc.folder,
            isAuthorized: (doc: DocumentDto) => doc != null && documentSpacePrivilegesService.isAuthorizedForAction(doc.spaceId, DocumentSpacePrivilegeDtoTypeEnum.Write),
            onClick: (doc: DocumentDto) => pageService.mergeState({ 
              selectedFile: doc, 
              createEditElementOpType: CreateEditOperationType.EDIT_FOLDERNAME, 
            })
          },
          { 
            title: 'Rename File', 
            icon: EditIcon, 
            shouldShow: (doc: DocumentDto) => doc && !doc.folder,
            isAuthorized: (doc: DocumentDto) => doc != null && documentSpacePrivilegesService.isAuthorizedForAction(doc.spaceId, DocumentSpacePrivilegeDtoTypeEnum.Write),
            onClick: (doc: DocumentDto) => pageService.mergeState({ 
              selectedFile: doc, 
              createEditElementOpType: CreateEditOperationType.EDIT_FILENAME, 
            })
          },
        ] as PopupMenuItem<DocumentDto>[],
      },
    })
  ]);

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
      pageService.loadDocSpaceFromLocation(location.search);
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
      documentSpaceService.resetState();
      documentSpacePrivilegesService.resetState();
    };   
  }, []);

  useEffect(() => {
    pageService.loadDocSpaceFromLocation(location.search);
  }, [location.search]);

  function conditionalMenuDownloadOnClick (doc: DocumentDto) {
    if(doc.folder && !doc.hasContents){
      createTextToast(ToastType.WARNING, 'Unable to download a folder with no contents')
    }else{
      window.location.href = downloadUrlService.createRelativeFilesDownloadUrl(doc.spaceId, doc.path, [doc])
    }
  }
  // Handle hiding columns on resize
  useEffect(() => {
    const hideableColumns = documentDtoColumns.filter(column => column.field.value !== 'key' && column.field.value !== 'lastModifiedDate' && column.headerName.value !== 'More');
    if (deviceInfo.isMobile || deviceInfo.deviceBySize <= DeviceSize.TABLET) {
      hideableColumns.forEach(column => {
        if (!column.hide.value) {
          column.hide.set(true)
        }
      });

      // Get the "More" actions column
      const moreActionsColumn = documentDtoColumns.find(column => column.headerName.value === 'More');
      
      // Check if "Download" action already exists
      const cellRendererParams = (moreActionsColumn?.cellRendererParams as State<{ menuItems: PopupMenuItem<DocumentDto>[] }>);
      const downloadAction = cellRendererParams.menuItems.find(menuItem => menuItem.title.value === 'Download');

      if (downloadAction == null) {
        cellRendererParams.set(state => {
          state.menuItems.splice(0, 0, { 
            title: 'Download', 
            icon: DownloadMaterialIcon,
            iconProps: {
              style: 'primary',
              fill: true
            },
            shouldShow: (doc: DocumentDto) => doc != null,
            isAuthorized: () => true,
            onClick: conditionalMenuDownloadOnClick
          });
  
          return state;
        });
      }
    } else {
      hideableColumns.forEach(column => {
        if (column.hide.value) {
          column.hide.set(false)
        }
      });

      // Remove Download from "More" actions cell renderer
      const moreActionsColumn = documentDtoColumns.find(column => column.headerName.value === 'More');
      (moreActionsColumn?.cellRendererParams as State<{ menuItems: PopupMenuItem<DocumentDto>[] }>).menuItems.find(menuItem => menuItem.title.value === 'Download')?.set(none);
    }
  }, [deviceInfo.isMobile, deviceInfo.deviceBySize]);

  async function handleDocumentSpaceCreation(space: DocumentSpaceRequestDto) {
    try {
      const createdSpace = await pageService.submitDocumentSpace(space);

      const queryParams = pageService.getUrlParametersForSpaceAndPath(createdSpace.id);
      history.push({ search: queryParams.toString() });
    } catch (error) {
      createTextToast(ToastType.ERROR, prepareRequestError(error).message);
    }
  }

  const isDocumentSpacesLoading =
    documentSpaceService.isDocumentSpacesStatePromised;
  const isDocumentSpacesErrored =
    documentSpaceService.isDocumentSpacesStateErrored;

  return (
    <PageFormat pageTitle="Document Space" className="document-space-page">
      <FormGroup labelName="document-space" labelText="Spaces" isError={false} className="document-space-page__space-select">
        <div className="add-space-container">
          <div>
            <DocumentSpaceSelector 
              isDocumentSpacesLoading={isDocumentSpacesLoading}
              isDocumentSpacesErrored={isDocumentSpacesErrored}
              documentSpaceService={documentSpaceService}
              selectedSpace={pageService.state.selectedSpace?.value}
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

            {documentSpaceService.documentSpaces.length && (
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
      {pageService.state.selectedSpace.value != null &&
        pageService.state.datasource.value &&
        documentSpacePrivilegesService.isAuthorizedForAction(
          pageService.state.selectedSpace.value.id,
          DocumentSpacePrivilegeDtoTypeEnum.Read
        ) && (
          <div className="breadcrumb-area">
            <BreadCrumbTrail
              path={pageService.state.get().path}
              onNavigate={(newPath) => {
                const queryParams = new URLSearchParams(location.search);
                queryParams.set(spaceIdQueryKey, pageService.state.get().selectedSpace?.id ?? '');
                if (newPath !== '') {
                  queryParams.set(pathQueryKey, newPath);
                } else {
                  queryParams.delete(pathQueryKey);
                }
                history.push({ search: queryParams.toString() });
              }}
            />
            <DocumentSpaceActions
              show={pageService.state.selectedSpace.value != null && !documentSpacePrivilegesService.isPromised}
              isMobile={deviceInfo.deviceBySize <= DeviceSize.TABLET || deviceInfo.isMobile}
              selectedSpace={pageService.state.selectedSpace}
              path={pageService.state.nested('path')}
              shouldUpdateDatasource={pageService.state.shouldUpdateDatasource}
              createEditElementOpType={pageService.state.createEditElementOpType}
              membershipsState={pageService.state.membershipsState}
              selectedFiles={pageService.state.selectedFiles}
              showDeleteSelectedDialog={pageService.state.showDeleteSelectedDialog}
              className="content-controls"
            />
          </div>
      )}
      {pageService.state.selectedSpace.value != null &&
        pageService.state.datasource.value &&
        <FullPageInfiniteGrid
          columns={documentDtoColumns.attach(Downgraded).value}
          datasource={pageService.state.datasource.value}
          cacheBlockSize={generateInfiniteScrollLimit(pageService.infiniteScrollOptions)}
          maxBlocksInCache={pageService.infiniteScrollOptions.maxBlocksInCache}
          maxConcurrentDatasourceRequests={pageService.infiniteScrollOptions.maxConcurrentDatasourceRequests}
          suppressCellSelection
          updateDatasource={pageService.state.shouldUpdateDatasource.value}
          updateDatasourceCallback={pageService.onDatasourceUpdateCallback.bind(pageService)}
          getRowNodeId={pageService.getDocumentUniqueKey.bind(pageService)}
          onRowSelected={pageService.onDocumentRowSelected.bind(pageService)}
          rowSelection="multiple"
          suppressRowClickSelection
          autoResizeColumns
        />
      }

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
                selectedFile: undefined
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

import { none, SetPartialStateAction, State, useHookstate } from '@hookstate/core';
import { IDatasource, ValueFormatterParams } from 'ag-grid-community';
import React, { ChangeEvent, useEffect, useRef } from 'react';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import BreadCrumbTrail from '../../components/BreadCrumbTrail/BreadCrumbTrail';
import Button from '../../components/Button/Button';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import DocSpaceItemRenderer from '../../components/DocSpaceItemRenderer/DocSpaceItemRenderer';
import DocumentRowActionCellRenderer, { PopupMenuItem }  from '../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import Select from '../../components/forms/Select/Select';
import { GridSelectionType } from '../../components/Grid/grid-selection-type';
import GridColumn from '../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import InfiniteScrollGrid from '../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import PageFormat from '../../components/PageFormat/PageFormat';
import { SideDrawerSize } from '../../components/SideDrawer/side-drawer-size';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import AddMaterialIcon from '../../icons/AddMaterialIcon';
import {
  DocumentDto,
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceRequestDto,
  DocumentSpaceResponseDto
} from '../../openapi';
import { useAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { useDocumentSpacePrivilegesState, useDocumentSpaceState } from '../../state/document-space/document-space-state';
import { PrivilegeType } from '../../state/privilege/privilege-type';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { formatBytesToString } from '../../utils/file-utils';
import DeleteDocumentDialog from './DocumentDelete';
import DocumentDownloadCellRenderer from './DocumentDownloadCellRenderer';
import DocumentSpaceCreateEditForm from './DocumentSpaceCreateEditForm';
import DocumentSpaceEditForm from './DocumentSpaceEditForm';
import DocumentSpaceMemberships from './Memberships/DocumentSpaceMemberships';
import DocumentSpaceMySettingsForm from "./DocumentSpaceMySettingsForm";
import './DocumentSpacePage.scss';
import UserIcon from "../../icons/UserIcon";
import UserIconCircle from "../../icons/UserIconCircle";
import CircleMinusIcon from '../../icons/CircleMinusIcon';
import CircleRightArrowIcon from '../../icons/CircleRightArrowIcon';
import EditIcon from '../../icons/EditIcon';
import StarIcon from '../../icons/StarIcon';
import UploadIcon from '../../icons/UploadIcon';
import DesktopActions from '../../components/documentspace/Actions/DesktopActions/DesktopActions';
import MobileActions from '../../components/documentspace/Actions/MobileActions/MobileActions';

export enum CreateEditOperationType {
  NONE,
  CREATE_FOLDER,
  EDIT_FOLDERNAME,
  EDIT_FILENAME
}

function getCreateEditTitle(type: CreateEditOperationType) {
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

const documentDtoColumns: GridColumn[] = [
  new GridColumn({
    field: 'key',
    headerName: 'Name',
    resizable: true,
    cellRenderer: DocSpaceItemRenderer,
    checkboxSelection: true,
    initialWidth: 400,
  }),
  new GridColumn({
    field: 'lastModifiedDate',
    headerName: 'Last Modified',
    resizable: true,
    initialWidth: 500,
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
  })
];

const infiniteScrollOptions: InfiniteScrollOptions = {
  enabled: true,
  limit: 100,
};

interface DocumentSpacePageState {
  drawerOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  showErrorMessage: boolean;
  selectedSpace?: DocumentSpaceResponseDto;
  shouldUpdateDatasource: boolean;
  datasource?: IDatasource;
  showUploadDialog: boolean;
  showDeleteDialog: boolean;
  fileToDelete: string;
  selectedFiles: DocumentDto[];
  membershipsState: {
    isOpen: boolean;
  },
  createEditElementOpType: CreateEditOperationType;
  clickedItemName?: string;
  path: string;
  showDeleteSelectedDialog: boolean;
  isDefaultDocumentSpaceSettingsOpen: boolean;
  sideDrawerSize: SideDrawerSize;
}

function getDocumentUniqueKey(data: DocumentDto): string {
  return data.path + '__' + data.key;
}

const spaceIdQueryKey = 'spaceId';
const pathQueryKey = 'path';

function DocumentSpacePage() {
  const pageState = useHookstate<DocumentSpacePageState>({
    drawerOpen: false,
    isSubmitting: false,
    showErrorMessage: false,
    errorMessage: '',
    selectedSpace: undefined,
    shouldUpdateDatasource: false,
    datasource: undefined,
    showUploadDialog: false,
    showDeleteDialog: false,
    fileToDelete: '',
    selectedFiles: [],
    membershipsState: {
      isOpen: false
    },
    createEditElementOpType: CreateEditOperationType.NONE,
    path: '',
    showDeleteSelectedDialog: false,
    isDefaultDocumentSpaceSettingsOpen: false,
    sideDrawerSize: SideDrawerSize.WIDE,
  });

  const location = useLocation();
  const history = useHistory();

  const documentSpaceService = useDocumentSpaceState();
  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const authorizedUserService = useAuthorizedUserState();

  const isAdmin = authorizedUserService.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN);

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const spacesCancellableRequest = documentSpaceService.fetchAndStoreSpaces();

    async function setInitialSpaceOnLoad() {
      try {
        const data = await spacesCancellableRequest.promise;

        if (data?.length > 0) {
          const queryParams = new URLSearchParams(location.search);
          if (queryParams.get(spaceIdQueryKey) != null) {
            loadDocSpaceFromLocation(location, data);
          } else {
            const defaultDocumentSpaceId = authorizedUserService.authorizedUser?.defaultDocumentSpaceId;
            const defaultDocumentSpace = data.find(d => d.id === defaultDocumentSpaceId);
            if (defaultDocumentSpace != null) {
              setStateOnDocumentSpaceAndPathChange(defaultDocumentSpace, '');
            } else {
              setStateOnDocumentSpaceAndPathChange(data[0], '');
            }
          }
        }
      } catch (err) {
        createTextToast(ToastType.ERROR, 'Could not load Document Spaces');
      }
    }

    setInitialSpaceOnLoad();

    return function cleanup() {
      mountedRef.current = false;

      if (spacesCancellableRequest != null) {
        spacesCancellableRequest.cancelTokenSource.cancel();
      }

      documentSpaceService.resetState();
      documentSpacePrivilegesService.resetState();
    };
  }, []);

  useEffect(() => {
    loadDocSpaceFromLocation(location, documentSpaceService.documentSpaces);
  }, [location.search]);

  function loadDocSpaceFromLocation(locationService: any, documentSpaceList: Array<DocumentSpaceResponseDto>) {
    const queryParams = new URLSearchParams(locationService.search);
    if (queryParams.get(spaceIdQueryKey) != null && documentSpaceList.length > 0) {
      const selectedDocumentSpace = documentSpaceList.find(documentSpace => documentSpace.id === queryParams.get('spaceId'));
      if (selectedDocumentSpace == null) {
        createTextToast(ToastType.ERROR, 'Could not process the selected Document Space');
        return;
      }
      const path = queryParams.get(pathQueryKey) ?? '';
      if (selectedDocumentSpace.id !== pageState.get().selectedSpace?.id ||
        path !== pageState.get().path) {
        setStateOnDocumentSpaceAndPathChange(selectedDocumentSpace, path);
      }
    }
  }

  function mergePageState(partialState: Partial<DocumentSpacePageState>): void {
    if (mountedRef.current) {
      mergeState<DocumentSpacePageState>(pageState, partialState);
    }
  }

  function mergeState<T>(state: State<T>, partialState: SetPartialStateAction<T>): void {
    if (mountedRef.current) {
      state.merge(partialState);
    }
  }

  async function setStateOnDocumentSpaceAndPathChange(documentSpace: DocumentSpaceResponseDto, path: string) {
    try {
      // Don't need to load privileges if current user is Dashboard Admin,
      // since they currently have access to everything Document Space related
      if (!isAdmin) {
        await documentSpacePrivilegesService.fetchAndStoreDashboardUserDocumentSpacePrivileges(documentSpace.id).promise;
      }
      mergePageState({
        selectedSpace: documentSpace,
        shouldUpdateDatasource: true,
        datasource: documentSpaceService.createDatasource(
          documentSpace.id,
          path,
          infiniteScrollOptions
        ),
        path,
        selectedFiles: [],
      });
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get(spaceIdQueryKey) == null) {
        queryParams.set(spaceIdQueryKey, documentSpace.id);
        history.replace({ search: queryParams.toString() });
      }
    } 
    catch (err) {
      const preparedError = prepareRequestError(err);

      if (!mountedRef.current) {
        return;
      }

      if (preparedError.status === 403) {
        createTextToast(ToastType.ERROR, 'Not authorized for the selected Document Space');
      } else {
        createTextToast(ToastType.ERROR, 'Could not load privileges for the selected Document Space');
      }

      mergePageState({
        selectedSpace: undefined,
        datasource: undefined,
        shouldUpdateDatasource: false,
        selectedFiles: [],
      });
    }
  }

  function onDocumentSpaceSelectionChange(
    event: ChangeEvent<HTMLSelectElement>
  ): void {
    const documentSpaceId = event.target.value;
    if (documentSpaceId != null) {
      setNewDocumentSpaceIdQueryParam(documentSpaceId);
    }
  }

  function setNewDocumentSpaceIdQueryParam(documentSpaceId: string) {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get(spaceIdQueryKey) !== documentSpaceId) {
      queryParams.set(spaceIdQueryKey, documentSpaceId);
      queryParams.delete(pathQueryKey);
      history.push({ search: queryParams.toString() });
    }
  }

  function onDatasourceUpdateCallback() {
    pageState.shouldUpdateDatasource.set(false);
  }

  function getSpaceOptions() {
    if (isDocumentSpacesLoading) {
      return (
        <option value="loading">
          Loading...
        </option>
      )
    }

    if (isDocumentSpacesErrored) {
      return (
        <option value="error">
          Could not load Document Spaces
        </option>
      )
    }

    return documentSpaceService.documentSpaces.map((item) =>
      <option key={item.id} value={item.id}>
        {item.name}
      </option>
    );
  }

  function setPageStateOnException(message: string) {
    mergePageState({
      isSubmitting: false,
      errorMessage: message,
      showErrorMessage: true,
    })
  }

  function submitElementName(name: string) {
    pageState.merge({ isSubmitting: true });
    if (pageState.selectedSpace.value?.id === undefined) return;

    switch (pageState.createEditElementOpType.get()) {
      case CreateEditOperationType.EDIT_FOLDERNAME:
        documentSpaceService.renameFolder(pageState.selectedSpace.value?.id, 
          pageState.get().path + "/" + pageState.clickedItemName.get(), 
          name)
          .then(() => {
            mergePageState({
              createEditElementOpType: CreateEditOperationType.NONE,
              isSubmitting: false,
              showErrorMessage: false,
              shouldUpdateDatasource: true,
              clickedItemName: undefined,
            });
            createTextToast(ToastType.SUCCESS, "Folder renamed");
          })
          .catch(message => setPageStateOnException(message));
        break;
      case CreateEditOperationType.CREATE_FOLDER:
        documentSpaceService.createNewFolder(pageState.selectedSpace.value?.id, 
          pageState.get().path, name)
          .then(() => {
            mergePageState({
              createEditElementOpType: CreateEditOperationType.NONE,
              isSubmitting: false,
              showErrorMessage: false,
              shouldUpdateDatasource: true,
            });
            createTextToast(ToastType.SUCCESS, "Folder created");
          })
          .catch(message => setPageStateOnException(message));
        break;
      case CreateEditOperationType.EDIT_FILENAME:
        documentSpaceService.renameFile(pageState.selectedSpace.value?.id, 
          pageState.get().path, 
          pageState.clickedItemName.get() ?? '',  // blank if undefined, will allow to fail out..
          name)
          .then(() => {
            mergePageState({
              createEditElementOpType: CreateEditOperationType.NONE,
              isSubmitting: false,
              showErrorMessage: false,
              shouldUpdateDatasource: true,
              clickedItemName: undefined,
            });
            createTextToast(ToastType.SUCCESS, "File renamed");
          })
          .catch(message => setPageStateOnException(message));
        break;
      default:
        break;
    }
  }

  function submitDocumentSpace(space: DocumentSpaceRequestDto) {
    pageState.merge({ isSubmitting: true });
    documentSpaceService
      .createDocumentSpace(space)
      .then((docSpace) => {
        mergePageState({
          drawerOpen: false,
          isSubmitting: false,
          showErrorMessage: false,
          selectedSpace: docSpace,
          shouldUpdateDatasource: true,
          path: '',
          datasource: documentSpaceService.createDatasource(docSpace.id, '', infiniteScrollOptions)
        });
        setNewDocumentSpaceIdQueryParam(docSpace.id);
      })
      .catch((message) => setPageStateOnException(message));
  }

  function closeDrawer(): void {
    pageState.merge({ drawerOpen: false });
  }

  function closeMySettingsDrawer(): void {
    pageState.merge({ isDefaultDocumentSpaceSettingsOpen: false });
  }

  function submitDefaultDocumentSpace(spaceId: string) {
    pageState.merge({ isSubmitting: true });
    documentSpaceService
      .patchDefaultDocumentSpace(spaceId)
      .then((docSpaceId) => {

        authorizedUserService.setDocumentSpaceDefaultId(docSpaceId);
        mergePageState({
          isDefaultDocumentSpaceSettingsOpen: false,
          isSubmitting: false,
          showErrorMessage: false,
          path: '',
        });
      })
      .catch((message) => setPageStateOnException(message));
  }

  function closeErrorMsg(): void {
    pageState.merge({ showErrorMessage: false });
  }

  function closeRemoveDialog(): void {
    pageState.merge({ showDeleteDialog: false, showDeleteSelectedDialog: false });
  }

  async function archiveFile(): Promise<void> {
    const selectedSpace = pageState.selectedSpace.value;

    if (selectedSpace == null) {
      return;
    }

    try {
      await documentSpaceService.archiveItems(
        selectedSpace.id,
        pageState.get().path,
        pageState.get().selectedFiles.map(item => item.key)
      );
      createTextToast(ToastType.SUCCESS, 'File Archived');
    }
    catch (e) {
      createTextToast(ToastType.ERROR, 'Could not archive files - ' + (e as Error).message);
    }

    pageState.merge({
      shouldUpdateDatasource: true,
      selectedFiles: [],
      datasource: documentSpaceService.createDatasource(
        pageState.get().selectedSpace?.id ?? '',
        pageState.get().path,
        infiniteScrollOptions
      ),
    });
    closeRemoveDialog();
  }

  function onDocumentRowSelected(data: DocumentDto, selectionEvent: GridSelectionType) {
    const selectedFiles = pageState.selectedFiles;
    if (selectionEvent === 'selected') {
      selectedFiles[selectedFiles.length].set(data);
    } else {
      selectedFiles.find(document => document.key.value === data.key)?.set(none);
    }
  }

  const isDocumentSpacesLoading =
    documentSpaceService.isDocumentSpacesStatePromised;
  const isDocumentSpacesErrored =
    documentSpaceService.isDocumentSpacesStateErrored;

  function documentDtoColumnsWithConditionalDelete() {
    const columns = (pageState.selectedSpace.value && documentSpacePrivilegesService.isAuthorizedForAction(pageState.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Write)) ?
      [
        ...documentDtoColumns,
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
                shouldShow: (doc: DocumentDto) => doc && !doc.folder,
                isAuthorized: () => true,
                onClick: () => console.log('add to favorites'),
                
              },
              { 
                title: 'Go to file', 
                icon: CircleRightArrowIcon, 
                shouldShow: (doc: DocumentDto) => doc && !doc.folder,
                isAuthorized: () => true,
                onClick: () => console.log('go to file') 
              },
              { 
                title: 'Upload new version', 
                icon: UploadIcon, 
                shouldShow: (doc: DocumentDto) => doc && !doc.folder,
                isAuthorized: () => true,
                onClick: () => console.log('upload') 
              },
              {
                title: 'Remove',
                icon: CircleMinusIcon,
                isAuthorized: () => true,
                onClick: (doc: DocumentDto) => mergeState(pageState, { selectedFiles: [doc], showDeleteDialog: true }),
              },
              { 
                title: 'Rename Folder', 
                icon: EditIcon, 
                shouldShow: (doc: DocumentDto) => doc && doc.folder,
                isAuthorized: () => true,
                onClick: (doc: DocumentDto) => mergeState(pageState, { 
                  clickedItemName: doc.key, 
                  createEditElementOpType: CreateEditOperationType.EDIT_FOLDERNAME, 
                })
              },
              { 
                title: 'Rename File', 
                icon: EditIcon, 
                shouldShow: (doc: DocumentDto) => doc && !doc.folder,
                isAuthorized: () => true,
                onClick: (doc: DocumentDto) => mergeState(pageState, { 
                  clickedItemName: doc.key, 
                  createEditElementOpType: CreateEditOperationType.EDIT_FILENAME, 
                })
              },
            ] as PopupMenuItem<DocumentDto>[],
          },
        })
      ]
      : documentDtoColumns;

    // modify the first column to have a DocSpaceItemRenderer
    columns[0] = new GridColumn({
      field: 'key',
      headerName: 'Name',
      resizable: true,
      cellRenderer: DocSpaceItemRenderer,
      checkboxSelection: true,
      initialWidth: 400,
      cellRendererParams: {
        onClick: (folder: string) => {
          const newPath = pageState.get().path + '/' + folder;
          const queryParams = new URLSearchParams(location.search);
          queryParams.set(spaceIdQueryKey, pageState.get().selectedSpace?.id ?? '');
          queryParams.set(pathQueryKey, newPath);
          history.push({ search: queryParams.toString() });
        }
      }
    });

    return columns;
  }

  return (
    <PageFormat pageTitle="Document Space">
      <FormGroup labelName="document-space" labelText="Spaces" isError={false}>
        <div className="add-space-container">
          <div>
            <Select
              id="document-space"
              name="document-space"
              value={pageState.selectedSpace.value?.id}
              disabled={isDocumentSpacesLoading || isDocumentSpacesErrored}
              onChange={onDocumentSpaceSelectionChange}
            >
              {getSpaceOptions()}
            </Select>
            {isAdmin && !documentSpacePrivilegesService.isPromised && (
              <Button
                data-testid="add-doc-space__btn"
                type="button"
                onClick={() => pageState.merge({ drawerOpen: true })}
                disabled={isDocumentSpacesLoading || isDocumentSpacesErrored}
              >
                Add New Space <AddMaterialIcon fill size={1} />
              </Button>
            )}

            {documentSpaceService.documentSpaces.length && (
              <Button
                data-testid="doc-space-my-settings__btn"
                type="button"
                style={{ position: 'absolute', right: 20 }}
                unstyled
                disableMobileFullWidth
                onClick={() => pageState.isDefaultDocumentSpaceSettingsOpen.set(true)}
              >
                <UserIcon size={0} />
              </Button>
            )}
          </div>
        </div>
      </FormGroup>
      <div className="breadcrumb-area">
        <BreadCrumbTrail
          path={pageState.get().path}
          onNavigate={(newPath) => {
            const queryParams = new URLSearchParams(location.search);
            queryParams.set(spaceIdQueryKey, pageState.get().selectedSpace?.id ?? '');
            if (newPath !== '') {
              queryParams.set(pathQueryKey, newPath);
            } else {
              queryParams.delete(pathQueryKey);
            }
            history.push({ search: queryParams.toString() });
          }}
        />
        <div>
          {pageState.selectedSpace.value != null &&
            !documentSpacePrivilegesService.isPromised && (
              <div className="content-controls">
                <MobileActions
                  selectedSpace={pageState.selectedSpace}
                  path={pageState.nested('path')}
                  shouldUpdateDatasource={pageState.shouldUpdateDatasource}
                  createEditElementOpType={pageState.createEditElementOpType}
                  membershipsState={pageState.membershipsState}
                />
                <DesktopActions
                  selectedSpace={pageState.selectedSpace}
                  path={pageState.nested('path')}
                  shouldUpdateDatasource={pageState.shouldUpdateDatasource}
                  createEditElementOpType={pageState.createEditElementOpType}
                  membershipsState={pageState.membershipsState}
                  selectedFiles={pageState.selectedFiles}
                  showDeleteSelectedDialog={pageState.showDeleteSelectedDialog}
                />
              </div>
            )}
        </div>
      </div>
      {pageState.selectedSpace.value != null &&
        pageState.datasource.value &&
        documentSpacePrivilegesService.isAuthorizedForAction(pageState.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Read) && (
          <InfiniteScrollGrid
            columns={documentDtoColumnsWithConditionalDelete()}
            datasource={pageState.datasource.value}
            cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
            maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
            maxConcurrentDatasourceRequests={
              infiniteScrollOptions.maxConcurrentDatasourceRequests
            }
            suppressCellSelection
            updateDatasource={pageState.shouldUpdateDatasource.value}
            updateDatasourceCallback={onDatasourceUpdateCallback}
            getRowNodeId={getDocumentUniqueKey}
            onRowSelected={onDocumentRowSelected}
            rowSelection="multiple"
          />
        )}

      <SideDrawer
        isLoading={false}
        title="Add New Document Space"
        isOpen={pageState.drawerOpen.get()}
        onCloseHandler={closeDrawer}
        size={pageState.sideDrawerSize.get()}
      >
        {pageState.drawerOpen.get() && <DocumentSpaceEditForm
          onCancel={closeDrawer}
          onSubmit={submitDocumentSpace}
          isFormSubmitting={pageState.isSubmitting.get()}
          formActionType={FormActionType.ADD}
          onCloseErrorMsg={closeErrorMsg}
          showErrorMessage={pageState.showErrorMessage.get()}
          errorMessage={pageState.errorMessage.get()}
        />}
      </SideDrawer>
      <SideDrawer
        isLoading={false}
        title={getCreateEditTitle(pageState.createEditElementOpType.get())}
        isOpen={pageState.createEditElementOpType.get() !== CreateEditOperationType.NONE}
        onCloseHandler={() => mergeState(pageState, { createEditElementOpType: CreateEditOperationType.NONE })}
        size={pageState.sideDrawerSize.get()}
      >
        {(pageState.createEditElementOpType.get() !== CreateEditOperationType.NONE) && <DocumentSpaceCreateEditForm
          onCancel={() => mergeState(pageState, { 
            showErrorMessage: false, 
            createEditElementOpType: CreateEditOperationType.NONE,
            clickedItemName: undefined,
          })}
          onSubmit={submitElementName}
          isFormSubmitting={pageState.isSubmitting.get()}
          onCloseErrorMsg={closeErrorMsg}
          showErrorMessage={pageState.showErrorMessage.get()}
          errorMessage={pageState.errorMessage.get()}
          elementName={pageState.clickedItemName.get() ?? ''}
          opType={pageState.createEditElementOpType.get()}
        />}
      </SideDrawer>
      <SideDrawer
        isLoading={false}
        title="My Settings"
        isOpen={pageState.isDefaultDocumentSpaceSettingsOpen.get()}
        onCloseHandler={closeMySettingsDrawer}
        size={SideDrawerSize.WIDE}
        titleStyle={{ color: '#5F96EA', marginTop: -2 }}
        preTitleNode={
          <div style={{ padding: '4px 4px 4px 4px', border: '1px solid #E5E5E5', borderRadius: 4, marginRight: 14 }}>
            <UserIconCircle size={0} />
          </div>
        }
      >
        <DocumentSpaceMySettingsForm
          onCancel={closeMySettingsDrawer}
          onSubmit={submitDefaultDocumentSpace}
          isFormSubmitting={pageState.isSubmitting.get()}
          formActionType={FormActionType.SAVE}
          documentSpaces={documentSpaceService.documentSpaces}
          authorizedUserService={authorizedUserService}
        />
      </SideDrawer>

      <DeleteDocumentDialog
        show={pageState.showDeleteDialog.get()}
        onCancel={closeRemoveDialog}
        onSubmit={archiveFile}
        file={pageState.selectedFiles.get().map(item => item.key.toString()).join(',')}
      />

      <DeleteDocumentDialog
        show={pageState.showDeleteSelectedDialog.get()}
        onCancel={closeRemoveDialog}
        onSubmit={archiveFile}
        file={null}
      />

      {pageState.selectedSpace.value &&
        !documentSpacePrivilegesService.isPromised &&
        documentSpacePrivilegesService.isAuthorizedForAction(pageState.selectedSpace.value.id, DocumentSpacePrivilegeDtoTypeEnum.Membership) && (
          <DocumentSpaceMemberships
            documentSpaceId={pageState.selectedSpace.value.id}
            isOpen={pageState.membershipsState.isOpen.value}
            onSubmit={() => pageState.membershipsState.isOpen.set(false)}
            onCloseHandler={() => pageState.membershipsState.isOpen.set(false)}
          />
        )}
    </PageFormat>
  );
}

export default DocumentSpacePage;

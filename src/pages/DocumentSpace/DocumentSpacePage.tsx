import { none, SetPartialStateAction, State, useHookstate } from '@hookstate/core';
import { IDatasource, ValueFormatterParams } from 'ag-grid-community';
import React, { ChangeEvent, useEffect, useRef } from 'react';
import BreadCrumbTrail from '../../components/BreadCrumbTrail/BreadCrumbTrail';
import Button from '../../components/Button/Button';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import DocSpaceItemRenderer from '../../components/DocSpaceItemRenderer/DocSpaceItemRenderer';
import DocumentRowActionCellRenderer from '../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import DropDown from '../../components/DropDown/DropDown';
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
import DownloadMaterialIcon from '../../icons/DownloadMaterialIcon';
import PeopleIcon from '../../icons/PeopleIcon';
import RemoveIcon from '../../icons/RemoveIcon';
import UploadMaterialIcon from '../../icons/UploadMaterialIcon';
import { DocumentDto, DocumentSpacePrivilegeDtoTypeEnum, DocumentSpaceRequestDto, DocumentSpaceResponseDto } from '../../openapi';
import { useAuthorizedUserState } from '../../state/authorized-user/authorized-user-state';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { useDocumentSpaceState } from '../../state/document-space/document-space-state';
import { PrivilegeType } from '../../state/privilege/privilege-type';
import { prepareRequestError } from '../../utils/ErrorHandling/error-handling-utils';
import { formatBytesToString } from '../../utils/file-utils';
import DeleteDocumentDialog from './DocumentDelete';
import DocumentDownloadCellRenderer from './DocumentDownloadCellRenderer';
import DocumentSpaceCreateEditFolderForm from './DocumentSpaceCreateEditFolderForm';
import DocumentSpaceEditForm from './DocumentSpaceEditForm';
import DocumentSpaceMemberships from './DocumentSpaceMemberships';
import './DocumentSpacePage.scss';
import DocumentUploadDialog from './DocumentUploadDialog';
import {useLocation} from 'react-router-dom';
import {useHistory} from 'react-router';

const documentDtoColumns: GridColumn[] = [
  new GridColumn({
    field: 'key',
    headerName: 'Name',
    resizable: true,
    cellRenderer: DocSpaceItemRenderer,
    checkboxSelection: true
  }),
  new GridColumn({
    field: 'lastModifiedDate',
    headerName: 'Last Modified',
    resizable: true,
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
  privilegeState: {
    privileges: Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>,
    isLoading: boolean
  },
  newFolderPrompt: boolean;
  path: string;
  showDeleteSelectedDialog: boolean;
}

function getDocumentUniqueKey(data: DocumentDto): string {
  return data.key;
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
    privilegeState: {
      privileges: {
        READ: false,
        WRITE: false,
        MEMBERSHIP: false
      },
      isLoading: false
    },
    newFolderPrompt: false,
    path: '',
    showDeleteSelectedDialog: false,
  });

  const location = useLocation();
  const history = useHistory();

  const documentSpaceService = useDocumentSpaceState();
  const authorizedUserService = useAuthorizedUserState();

  const isAdmin = authorizedUserService.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN);

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const spacesCancellableRequest = documentSpaceService.fetchAndStoreSpaces();

    async function setInitialSpaceOnLoad() {
      try {
        const data = await spacesCancellableRequest.promise;

        if (data && data.length > 0) {
          const queryParams = new URLSearchParams(location.search);
          if (queryParams.get(spaceIdQueryKey) != null) {
            loadDocSpaceFromLocation(location, data);
          } else {
            setStateOnDocumentSpaceAndPathChange(data[0], '');
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

      setStateOnDocumentSpaceAndPathChange(selectedDocumentSpace, path);
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
    let privileges: Record<DocumentSpacePrivilegeDtoTypeEnum, boolean> = {
      READ: false,
      WRITE: false,
      MEMBERSHIP: false
    };

    try {
      // Don't need to load privileges if current user is Dashboard Admin,
      // since they currently have access to everything Document Space related
      if (!isAdmin) {
        mergeState(pageState.privilegeState, {
          isLoading: true
        });

        privileges = await documentSpaceService.getDashboardUserPrivilegesForDocumentSpace(documentSpace.id);
      }

      mergePageState({
        selectedSpace: documentSpace,
        shouldUpdateDatasource: true,
        datasource: documentSpaceService.createDatasource(
          documentSpace.id,
          path,
          infiniteScrollOptions
        ),
        privilegeState: {
          privileges,
          isLoading: false
        },
        path,
      });
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get(spaceIdQueryKey) == null) {
        queryParams.set(spaceIdQueryKey, documentSpace.id);
        history.push({search: queryParams.toString()})
      }
    } catch (err) {
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
        privilegeState: {
          privileges,
          isLoading: false
        }
      });
    }
  }

  function onDocumentSpaceSelectionChange(
    event: ChangeEvent<HTMLSelectElement>
  ): void {
    const documentSpaceId = event.target.value;
    if (documentSpaceId != null) {
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get(spaceIdQueryKey) !== documentSpaceId) {
        queryParams.set(spaceIdQueryKey, documentSpaceId);
        queryParams.delete(pathQueryKey);
        history.push({search: queryParams.toString()});
      }
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

  function submitFolderName(name: string) {
    pageState.merge({ isSubmitting: true });
    if (pageState.selectedSpace.value?.id === undefined) return;
    documentSpaceService.createNewFolder(pageState.selectedSpace.value?.id, pageState.get().path, name)
      .then(() => {
        mergePageState({
          newFolderPrompt: false,
          isSubmitting: false,
          showErrorMessage: false,
          shouldUpdateDatasource: true
        });
      })
      .catch(message => {
        mergePageState({
          isSubmitting: false,
          errorMessage: message,
          showErrorMessage: true,
        });
      });
    mergeState(pageState.newFolderPrompt, false);
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
      })
      .catch((message) =>
        mergePageState({
          isSubmitting: false,
          errorMessage: message,
          showErrorMessage: true,
        })
      );
  }

  function closeDrawer(): void {
    pageState.merge({ drawerOpen: false });
  }

  function closeErrorMsg(): void {
    pageState.merge({ showErrorMessage: false });
  }

  function closeDeleteDialog(): void {
    pageState.merge({ showDeleteDialog: false, showDeleteSelectedDialog: false });
  }

  async function deleteFile(): Promise<void> {
    const selectedSpace = pageState.selectedSpace.value;

    if (selectedSpace == null) {
      return;
    }

    await documentSpaceService.deleteIems(
      selectedSpace.id,
      pageState.get().path,
      pageState.get().selectedFiles.map(item => item.key)
    );
    pageState.merge({
      shouldUpdateDatasource: true,
      selectedFiles: [],
      datasource: documentSpaceService.createDatasource(
        pageState.get().selectedSpace?.id ?? '',
        pageState.get().path,
        infiniteScrollOptions
      ),
    });
    closeDeleteDialog();
  }

  function onDocumentRowSelected(data: DocumentDto, selectionEvent: GridSelectionType) {
    const selectedFiles = pageState.selectedFiles;
    if (selectionEvent === 'selected') {
      selectedFiles[selectedFiles.length].set(data);
    } else {
      selectedFiles.find(document => document.key.value === data.key)?.set(none);
    }
  }

  function isAuthorizedForAction(actionType: DocumentSpacePrivilegeDtoTypeEnum) {
    return isAdmin || pageState.privilegeState.privileges.value[actionType];
  }

  const isDocumentSpacesLoading =
    documentSpaceService.isDocumentSpacesStatePromised;
  const isDocumentSpacesErrored =
    documentSpaceService.isDocumentSpacesStateErrored;

  const documentDtoColumnsWithConditionalDelete = () => {
    const columns = (isAuthorizedForAction(DocumentSpacePrivilegeDtoTypeEnum.Write)) ?
      [
        ...documentDtoColumns,
        new GridColumn({
          valueGetter: GridColumn.defaultValueGetter,
          headerName: 'More',
          headerClass: 'header-center',
          cellRenderer: DocumentRowActionCellRenderer,
          cellRendererParams: {
            actions: {
              delete: (doc: DocumentDto) => {
                pageState.merge({ selectedFiles: [doc], showDeleteDialog: true })
              }
            }
          }
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
      cellRendererParams: {
        onClick: (folder: string) => {
          const newPath = pageState.get().path + '/' + folder;
          const queryParams = new URLSearchParams(location.search);
          queryParams.set(spaceIdQueryKey, pageState.get().selectedSpace?.id ?? '');
          queryParams.set(pathQueryKey, newPath);
          history.push({search: queryParams.toString()});
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
            {isAdmin && !pageState.privilegeState.isLoading.value && (
              <Button
                data-testid="add-doc-space__btn"
                type="button"
                onClick={() => pageState.merge({ drawerOpen: true })}
                disabled={isDocumentSpacesLoading || isDocumentSpacesErrored}
              >
                Add New Space <AddMaterialIcon size={1.25} />
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
            history.push({search: queryParams.toString()});
          }}
        />
        <div>
          {pageState.selectedSpace.value != null &&
            !pageState.privilegeState.isLoading.value && (
              <div className="content-controls">


              { pageState.selectedSpace.value && isAuthorizedForAction(DocumentSpacePrivilegeDtoTypeEnum.Write)
                && <div data-testid="upload-new-file">
                    <DocumentUploadDialog
                      documentSpaceId={pageState.selectedSpace.value.id}
                      currentPath={pageState.get().path}
                      onFinish={() =>
                        pageState.merge({ shouldUpdateDatasource: true, })
                      }
                      buttonStyle={{ icon: true, className: 'rotate-icon'}}

                      value={<UploadMaterialIcon size={1} iconTitle="Upload Files" />}
                    />
                  </div>
                }

                {isAuthorizedForAction(
                  DocumentSpacePrivilegeDtoTypeEnum.Write
                ) && (
                  <DropDown
                    id="add-new-items"
                    data-testid="add-new-items"
                    anchorContent={<AddMaterialIcon size={1} iconTitle="Add Items" />}
                    items={[
                      { displayName: 'Add New Folder', action: () => pageState.merge({ newFolderPrompt: true }) }
                    ]}
                  />
                )}

                {isAuthorizedForAction(
                  DocumentSpacePrivilegeDtoTypeEnum.Write
                ) && (
                  <Button
                    type="button"
                    icon
                    disabled={pageState.get().selectedFiles.length === 0}
                    data-testid="delete-selected-items"
                    disableMobileFullWidth
                    onClick={() => pageState.showDeleteSelectedDialog.set(true)}
                  >
                    <RemoveIcon className="icon-color" size={1.25} />
                  </Button>
                )}

                {isAuthorizedForAction(
                  DocumentSpacePrivilegeDtoTypeEnum.Read
                ) && (
                  <DropDown
                    id="download-items"
                    data-testid="download-items"
                    anchorContent={<DownloadMaterialIcon size={1.25} iconTitle="Download Items" />}
                    items={[
                      { displayName: 'Download Selected',
                        action: () => window.open((pageState.selectedFiles.value.length > 0 && pageState.selectedSpace.value)
                          ? documentSpaceService.createRelativeFilesDownloadUrl(
                              pageState.selectedSpace.value.id,
                              pageState.get().path,
                              pageState.selectedFiles.value
                            )
                          : undefined)
                      },
                      { displayName: 'Download All Files (zip)',
                        action: () => pageState.selectedSpace.value && window.open(documentSpaceService.createRelativeDownloadAllFilesUrl(
                          pageState.selectedSpace.value.id))
                      }
                    ]}
                  />
                )}

                {isAuthorizedForAction(
                  DocumentSpacePrivilegeDtoTypeEnum.Membership
                ) && (
                  <Button
                    type="button"
                    unstyled
                    disableMobileFullWidth
                    onClick={() => pageState.membershipsState.isOpen.set(true)}
                  >
                    <PeopleIcon size={1.5} iconTitle="Manage Users" />
                  </Button>
                )}
              </div>
            )}
        </div>
      </div>
      {pageState.selectedSpace.value != null &&
        pageState.datasource.value &&
        isAuthorizedForAction(DocumentSpacePrivilegeDtoTypeEnum.Read) && (
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
        size={SideDrawerSize.NORMAL}
      >
        <DocumentSpaceEditForm
          onCancel={closeDrawer}
          onSubmit={submitDocumentSpace}
          isFormSubmitting={pageState.isSubmitting.get()}
          formActionType={FormActionType.ADD}
          onCloseErrorMsg={closeErrorMsg}
          showErrorMessage={pageState.showErrorMessage.get()}
          errorMessage={pageState.errorMessage.get()}
        />
      </SideDrawer>
      <SideDrawer
        isLoading={false}
        title="Add New Folder"
        isOpen={pageState.newFolderPrompt.get()}
        onCloseHandler={() => mergeState(pageState.newFolderPrompt, false)}
        size={SideDrawerSize.NORMAL}
      >
        <DocumentSpaceCreateEditFolderForm
          onCancel={() => pageState.newFolderPrompt.set(false)}
          onSubmit={submitFolderName}
          isFormSubmitting={pageState.isSubmitting.get()}
          formActionType={FormActionType.ADD}
          onCloseErrorMsg={closeErrorMsg}
          showErrorMessage={pageState.showErrorMessage.get()}
          errorMessage={pageState.errorMessage.get()}
        />
      </SideDrawer>

      <DeleteDocumentDialog
        show={pageState.showDeleteDialog.get()}
        onCancel={closeDeleteDialog}
        onSubmit={deleteFile}
        file={pageState.selectedFiles.get().map(item => item.key.toString()).join(',')}
      />

      <DeleteDocumentDialog
        show={pageState.showDeleteSelectedDialog.get()}
        onCancel={closeDeleteDialog}
        onSubmit={deleteFile}
        file={null}
      />

      {pageState.selectedSpace.value &&
        !pageState.privilegeState.isLoading.value &&
        isAuthorizedForAction(DocumentSpacePrivilegeDtoTypeEnum.Membership) && (
          <DocumentSpaceMemberships
            documentSpaceId={pageState.selectedSpace.value.id}
            isOpen={pageState.membershipsState.isOpen.value}
            onSubmit={() => pageState.membershipsState.isOpen.set(false)}
          />
        )}
    </PageFormat>
  );
}

export default DocumentSpacePage;

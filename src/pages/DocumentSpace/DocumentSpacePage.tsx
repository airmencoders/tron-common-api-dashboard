import { none, SetPartialStateAction, State, useHookstate } from '@hookstate/core';
import { IDatasource, ValueFormatterParams } from 'ag-grid-community';
import React, { ChangeEvent, useEffect, useRef } from 'react';
import BreadCrumbTrail from '../../components/BreadCrumbTrail/BreadCrumbTrail';
import Button from '../../components/Button/Button';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import DeleteCellRenderer from '../../components/DeleteCellRenderer/DeleteCellRenderer';
import DocSpaceItemRenderer from '../../components/DocSpaceItemRenderer/DocSpaceItemRenderer';
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

const documentDtoColumns: GridColumn[] = [
  new GridColumn({
    field: 'key',
    headerName: 'Name',
    resizable: true,
    cellRenderer: DocSpaceItemRenderer,
    checkboxSelection: true
  }),
  new GridColumn({
    field: 'uploadedDate',
    headerName: 'Last Modified',
    resizable: true,
  }),
  new GridColumn({
    field: 'uploadedBy',
    headerName: 'Updated By',
    resizable: true,
  }),
  new GridColumn({
    field: 'size',
    headerName: 'Size',
    resizable: true,
    valueFormatter: function (params: ValueFormatterParams) {
      if (params.value != null) {
        return formatBytesToString(params.value);
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
          setStateOnDocumentSpaceChange(data[0]);
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

  async function setStateOnDocumentSpaceChange(documentSpace: DocumentSpaceResponseDto) {
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
          pageState.get().path,
          infiniteScrollOptions
        ),
        privilegeState: {
          privileges,
          isLoading: false
        },
        path: '',
      });
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
    const selectedDocumentSpace = documentSpaceService.documentSpaces.find(documentSpace => documentSpace.id === event.target.value);

    if (selectedDocumentSpace == null) {
      createTextToast(ToastType.ERROR, 'Could not process the selected Document Space');
      return;
    }

    setStateOnDocumentSpaceChange(selectedDocumentSpace);
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
          datasource: documentSpaceService.createDatasource(docSpace.id, pageState.get().path, infiniteScrollOptions)
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
          headerName: 'Delete',
          headerClass: 'header-center',
          cellRenderer: DeleteCellRenderer,
          cellRendererParams: {
            onClick: (doc: DocumentDto) => {
              pageState.merge({ fileToDelete: doc.key, showDeleteDialog: true });
            },
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
      cellRendererParams: { 
        onClick: (folder: string) => {
          const newPath = pageState.get().path + '/' + folder;
          pageState.merge({
            path: newPath,
            shouldUpdateDatasource: true,
            datasource: documentSpaceService.createDatasource(
              pageState.get().selectedSpace?.id ?? '',
              newPath,
              infiniteScrollOptions
            ),
          })
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
          onNavigate={(path) =>
            mergePageState({
              path: path,
              selectedFiles: [],
              shouldUpdateDatasource: true,
              datasource: documentSpaceService.createDatasource(
                pageState.get().selectedSpace?.id ?? '',
                path,
                infiniteScrollOptions
              ),
            })
          }
        />
        <div>
          {pageState.selectedSpace.value != null &&
            !pageState.privilegeState.isLoading.value && (
              <div className="content-controls">
                {isAuthorizedForAction(
                  DocumentSpacePrivilegeDtoTypeEnum.Write
                ) && (
                  <DropDown
                    data-testid="add-new-items"
                    anchorContent={<AddMaterialIcon size={1} iconTitle="Add Items" />}
                  >
                    <div className="drop-down-menu-item" data-testid="add-new-folder-button">
                      <Button
                        type="button"
                        unstyled
                        onClick={() => pageState.newFolderPrompt.set(true)}
                      >
                        Add New Folder
                      </Button>
                    </div>
                    <hr />
                    <div className="drop-down-menu-item" data-testid="upload-new-file">
                      <DocumentUploadDialog
                        documentSpaceId={pageState.selectedSpace.value.id}
                        currentPath={pageState.get().path}
                        onFinish={() =>
                          pageState.shouldUpdateDatasource.set(true)
                        }
                        buttonStyle={{ unstyled: true }}
                      />
                    </div>
                  </DropDown>
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
                    anchorContent={<DownloadMaterialIcon size={1.25} iconTitle="Download Items" />}
                  >
                    <div className="drop-down-menu-item">
                      <a
                        href={
                          pageState.selectedFiles.value.length > 0
                            ? documentSpaceService.createRelativeFilesDownloadUrl(
                                pageState.selectedSpace.value.id,
                                pageState.selectedFiles.value
                              )
                            : undefined
                        }
                      >
                        <Button
                          data-testid="download-selected-files__btn"
                          unstyled
                          type="button"
                          disabled={pageState.selectedFiles.value.length === 0}
                        >
                          Download Selected
                        </Button>
                      </a>
                    </div>
                    <hr />
                    <div className="drop-down-menu-item">
                      <a
                        href={documentSpaceService.createRelativeDownloadAllFilesUrl(
                          pageState.selectedSpace.value.id
                        )}
                      >
                        <Button
                          unstyled
                          data-testid="download-all-files__btn"
                          type="button"
                        >
                          Download All Files (zip)
                        </Button>
                      </a>
                    </div>
                  </DropDown>
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
        file={pageState.fileToDelete.get()}
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

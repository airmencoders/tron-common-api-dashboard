import { none, useHookstate } from '@hookstate/core';
import { IDatasource, ValueFormatterParams } from 'ag-grid-community';
import React, { ChangeEvent, useEffect, useRef } from 'react';
import Button from '../../components/Button/Button';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import DeleteCellRenderer from '../../components/DeleteCellRenderer/DeleteCellRenderer';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import Select from '../../components/forms/Select/Select';
import { GridSelectionType } from '../../components/Grid/grid-selection-type';
import GridColumn from '../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import InfiniteScrollGrid from '../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import LoadingCellRenderer from '../../components/LoadingCellRenderer/LoadingCellRenderer';
import PageFormat from '../../components/PageFormat/PageFormat';
import { SideDrawerSize } from '../../components/SideDrawer/side-drawer-size';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { DocumentDto, DocumentSpaceRequestDto, DocumentSpaceResponseDto } from '../../openapi';
import { FormActionType } from '../../state/crud-page/form-action-type';
import { useDocumentSpaceState } from '../../state/document-space/document-space-state';
import { formatBytesToString } from '../../utils/file-utils';
import DeleteDocumentDialog from './DocumentDelete';
import DocumentDownloadCellRenderer from './DocumentDownloadCellRenderer';
import DocumentSpaceEditForm from './DocumentSpaceEditForm';
import './DocumentSpacePage.scss';
import DocumentUploadDialog from './DocumentUploadDialog';

const documentDtoColumns: GridColumn[] = [
  new GridColumn({
    field: 'key',
    headerName: 'Name',
    resizable: true,
    cellRenderer: LoadingCellRenderer,
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
    selectedFiles: []
  });

  const documentSpaceService = useDocumentSpaceState();

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

  function mergePageState(mergeState: Partial<DocumentSpacePageState>): void {
    if (mountedRef.current) {
      pageState.merge(mergeState);
    }
  }

  function setStateOnDocumentSpaceChange(documentSpace: DocumentSpaceResponseDto): void {
    mergePageState({
      selectedSpace: documentSpace,
      shouldUpdateDatasource: true,
      datasource: documentSpaceService.createDatasource(
        documentSpace.id,
        infiniteScrollOptions
      )
    });
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

  function submitDocumentSpace(space: DocumentSpaceRequestDto) {
    pageState.merge({ isSubmitting: true });
    documentSpaceService
      .createDocumentSpace(space)
      .then((s) => {
        mergePageState({
          drawerOpen: false,
          isSubmitting: false,
          showErrorMessage: false,
          selectedSpace: s,
          shouldUpdateDatasource: true,
          datasource: documentSpaceService.createDatasource(s.id, infiniteScrollOptions)
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
    pageState.merge({ showDeleteDialog: false });
  }

  async function deleteFile(): Promise<void> {
    const selectedSpace = pageState.selectedSpace.value;

    if (selectedSpace == null) {
      return;
    }

    await documentSpaceService.deleteFile(
      selectedSpace.id,
      pageState.fileToDelete.get()
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

  const isDocumentSpacesLoading =
    documentSpaceService.isDocumentSpacesStatePromised;
  const isDocumentSpacesErrored =
    documentSpaceService.isDocumentSpacesStateErrored;

  const documentDtoColumnsWithDelete = [
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
  ];

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
            <Button
              data-testid="add-doc-space__btn"
              type="button"
              onClick={() => pageState.merge({ drawerOpen: true })}
              disabled={isDocumentSpacesLoading || isDocumentSpacesErrored}
            >
              Add New Space
            </Button>
          </div>
          {pageState.selectedSpace.value != null &&
            <div>
              <a href={pageState.selectedFiles.value.length > 0 ? documentSpaceService.createRelativeFilesDownloadUrl(pageState.selectedSpace.value.id, pageState.selectedFiles.value) : undefined}>
                <Button
                  data-testid="download-selected-files__btn"
                  type="button"
                  disabled={pageState.selectedFiles.value.length === 0}
                >
                  Download Selected Files (zip)
                </Button>
              </a>

              <a href={documentSpaceService.createRelativeDownloadAllFilesUrl(pageState.selectedSpace.value.id)}>
                <Button
                  data-testid="download-all-files__btn"
                  type="button"
                >
                  Download All Files (zip)
                </Button>
              </a>

              <DocumentUploadDialog
                documentSpaceId={pageState.selectedSpace.value.id}
                onFinish={() => pageState.shouldUpdateDatasource.set(true)}
              />
            </div>
          }
        </div>
      </FormGroup>

      {pageState.selectedSpace.value != null && pageState.datasource.value && (
        <InfiniteScrollGrid
          columns={documentDtoColumnsWithDelete}
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
      <DeleteDocumentDialog
        show={pageState.showDeleteDialog.get()}
        onCancel={closeDeleteDialog}
        onSubmit={deleteFile}
        file={pageState.fileToDelete.get()}
      />
    </PageFormat>
  );
}

export default DocumentSpacePage;

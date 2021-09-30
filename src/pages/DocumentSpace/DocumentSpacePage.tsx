import { none, useHookstate } from '@hookstate/core';
import { IDatasource, ValueFormatterParams } from 'ag-grid-community';
import React, { ChangeEvent, useEffect } from 'react';
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
import { DocumentDto, DocumentSpaceInfoDto } from '../../openapi';
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
  selectedSpace: string;
  shouldUpdateDatasource: boolean;
  datasource?: IDatasource;
  showUploadDialog: boolean;
  showDeleteDialog: boolean;
  fileToDelete: string;
  selectedFiles: DocumentDto[];
}

const selectedSpaceDefaultValue = 'Select a Space';

function getDocumentUniqueKey(data: DocumentDto): string {
  return data.key;
}

function DocumentSpacePage() {
  const pageState = useHookstate<DocumentSpacePageState>({
    drawerOpen: false,
    isSubmitting: false,
    showErrorMessage: false,
    errorMessage: '',
    selectedSpace: '',
    shouldUpdateDatasource: false,
    datasource: undefined,
    showUploadDialog: false,
    showDeleteDialog: false,
    fileToDelete: '',
    selectedFiles: []
  });

  const documentSpaceService = useDocumentSpaceState();

  useEffect(() => {
    const spacesCancellableRequest = documentSpaceService.fetchAndStoreSpaces();

    return function cleanup() {
      if (spacesCancellableRequest != null) {
        spacesCancellableRequest.cancelTokenSource.cancel();
      }

      documentSpaceService.resetState();
    };
  }, []);

  function onDocumentSpaceSelectionChange(
    event: ChangeEvent<HTMLSelectElement>
  ): void {
    pageState.merge({
      selectedSpace: event.target.value,
      shouldUpdateDatasource: true,
      datasource: documentSpaceService.createDatasource(
        event.target.value,
        infiniteScrollOptions
      )
    });
  }

  function onDatasourceUpdateCallback() {
    pageState.shouldUpdateDatasource.set(false);
  }

  function isSelectedSpaceValid(): boolean {
    const selectedSpace = pageState.selectedSpace.value;

    return (
      selectedSpace?.trim() !== '' &&
      selectedSpace !== selectedSpaceDefaultValue
    );
  }

  function getSpaceValues(): DocumentSpaceInfoDto[] {
    if (isDocumentSpacesLoading) {
      return [{ name: 'Loading...' }];
    }

    if (isDocumentSpacesErrored) {
      return [{ name: 'Could not load Document Spaces' }];
    }

    if (isSelectedSpaceValid()) {
      return documentSpaceService.documentSpaces;
    }

    return [
      { name: selectedSpaceDefaultValue },
      ...documentSpaceService.documentSpaces,
    ];
  }

  function submitDocumentSpace(space: DocumentSpaceInfoDto) {
    pageState.merge({ isSubmitting: true });
    documentSpaceService
      .createDocumentSpace(space)
      .then((s) => {
        pageState.merge({
          drawerOpen: false,
          isSubmitting: false,
          showErrorMessage: false,
          selectedSpace: s.name,
          shouldUpdateDatasource: true,
          datasource: documentSpaceService.createDatasource(s.name, infiniteScrollOptions)
        });
      })
      .catch((message) =>
        pageState.merge({
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
    await documentSpaceService.deleteFile(
      pageState.selectedSpace.get(),
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
              value={pageState.selectedSpace.get()}
              disabled={isDocumentSpacesLoading || isDocumentSpacesErrored}
              onChange={onDocumentSpaceSelectionChange}
            >
              {getSpaceValues().map((item) => {
                return (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                );
              })}
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
          {isSelectedSpaceValid() &&
            <div>
              <a href={pageState.selectedFiles.value.length > 0 ? documentSpaceService.createRelativeFilesDownloadUrl(pageState.selectedSpace.value, pageState.selectedFiles.value) : undefined}>
                <Button
                  data-testid="download-selected-files__btn"
                  type="button"
                  disabled={pageState.selectedFiles.value.length === 0}
                >
                  Download Selected Files (zip)
                </Button>
              </a>

              <a href={documentSpaceService.createRelativeDownloadAllFilesUrl(pageState.selectedSpace.value)}>
                <Button
                  data-testid="download-all-files__btn"
                  type="button"
                >
                  Download All Files (zip)
                </Button>
              </a>

              <DocumentUploadDialog
                space={pageState.selectedSpace.get()}
                onFinish={() => pageState.shouldUpdateDatasource.set(true)}
              />
            </div>
          }
        </div>
      </FormGroup>

      {isSelectedSpaceValid() && pageState.datasource.value && (
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

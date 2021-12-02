import { Downgraded, none, useHookstate } from '@hookstate/core';
import { GridApi, IDatasource, ValueFormatterParams } from 'ag-grid-community';
import { useEffect, useRef } from 'react';
import Button from '../../components/Button/Button';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import DocSpaceItemRenderer from '../../components/DocSpaceItemRenderer/DocSpaceItemRenderer';
import DocumentRowActionCellRenderer from '../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import GenericDialog from '../../components/GenericDialog/GenericDialog';
import FullPageInfiniteGrid from "../../components/Grid/FullPageInifiniteGrid/FullPageInfiniteGrid";
import { GridSelectionType } from '../../components/Grid/grid-selection-type';
import GridColumn from '../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import PageFormat from '../../components/PageFormat/PageFormat';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { DeviceSize, useDeviceInfo } from '../../hooks/PageResizeHook';
import CircleMinusIcon from '../../icons/CircleMinusIcon';
import CircleRightArrowIcon from '../../icons/CircleRightArrowIcon';
import RemoveAllIcon from '../../icons/RemoveAllIcon';
import RemoveIcon from '../../icons/RemoveIcon';
import RestoreIcon from '../../icons/RestoreIcon';
import { DocumentDto, DocumentSpacePrivilegeDtoTypeEnum } from '../../openapi';
import { ArchivedStatus } from '../../state/document-space/document-space-service';
import { useDocumentSpacePrivilegesState, useDocumentSpaceState } from '../../state/document-space/document-space-state';
import { formatDocumentSpaceDate } from '../../utils/date-utils';
import { formatBytesToString, reduceDocumentDtoListToUnique } from '../../utils/file-utils';
import { shortenString } from '../../utils/string-utils';
import './DocumentSpaceArchivedItemsPage.scss';

interface PageState {
  datasource?: IDatasource;
  privilegeState: {
    privileges: Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>;
    isLoading: boolean;
  };
  shouldUpdateDatasource: boolean;
  selectedFiles: DocumentDto[];
  selectedFile?: DocumentDto;
  showDeleteDialog: boolean;
  showSingleDeleteDialog: boolean;
  showRestoreDialog: boolean;
  showDeleteAllDialog: boolean;
  userCanDeleteSomethingArchived: boolean;
}

const infiniteScrollOptions: InfiniteScrollOptions = {
  enabled: false,
  limit: 1000,
};

export default function DocumentSpaceArchivedItemsPage() {
  const pageState = useHookstate<PageState>({
    datasource: undefined,
    shouldUpdateDatasource: false,
    selectedFiles: [],
    selectedFile: undefined,
    privilegeState: {
      privileges: {
        READ: false,
        WRITE: false,
        MEMBERSHIP: false,
      },
      isLoading: false,
    },
    showDeleteDialog: false,
    showSingleDeleteDialog: false,
    showRestoreDialog: false,
    showDeleteAllDialog: false,
    userCanDeleteSomethingArchived: false,
  });

  const documentDtoColumns = useHookstate<GridColumn[]>([
    new GridColumn({
      field: 'key',
      headerName: 'Name',
      resizable: true,
      cellRenderer: DocSpaceItemRenderer,
      cellStyle: (params: any) => !checkHasWriteForDocSpace(params.node?.data) ? {'pointer-events': 'none', opacity: '0.4' } : '',
      cellRendererParams: {
        hideItemLink: true,
      },
      checkboxSelection: true
    }),
    new GridColumn({
      field: 'spaceName',
      headerName: 'Doc Space',
      resizable: true,
    }),
    new GridColumn({
      field: 'path',
      headerName: 'Path',
      resizable: true,
    }),
    new GridColumn({
      field: 'lastModifiedDate',
      headerName: 'Last Modified',
      resizable: true,
      valueFormatter: function (params: ValueFormatterParams) {
        if (params.value != null) {
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
      },
    }),
    new GridColumn({
      valueGetter: GridColumn.defaultValueGetter,
      headerName: 'More',
      headerClass: 'header-center',
      cellRenderer: DocumentRowActionCellRenderer,
      cellRendererParams: {
        menuItems: [
          {
            title: 'Restore',
            icon: CircleRightArrowIcon,
            onClick: () => restoreItems(),
            isAuthorized: (doc: DocumentDto) => checkHasWriteForDocSpace(doc),
          },
          {
            title: 'Permanently Delete',
            icon: CircleMinusIcon,
            onClick: (doc: DocumentDto) => pageState.merge({ showSingleDeleteDialog: true, selectedFile: doc }),
            isAuthorized: (doc: DocumentDto) => checkHasWriteForDocSpace(doc),
          },
        ],
      },
    })
  ]);

  const deviceInfo = useDeviceInfo();
  const gridApi = useRef<GridApi | undefined>(undefined);
  const documentSpaceService = useDocumentSpaceState();
  const docSpacePrivsState = useDocumentSpacePrivilegesState();
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    loadArchivedItems();

    return function cleanup() {
      mountedRef.current = false;
      documentSpaceService.resetState();
      docSpacePrivsState.resetState();
    };
  }, []);

  // Handle hiding columns on resize
  useEffect(() => {
    const hidableColumns = documentDtoColumns.filter(column => 
      column.field.value !== 'key' &&
      column.field.value !== 'spaceName' &&
      column.field.value !== 'path' &&
      column.headerName.value !== 'More'
    );

    if (deviceInfo.isMobile || deviceInfo.deviceBySize < DeviceSize.DESKTOP) {
      hidableColumns.forEach(column => column.hide.set(true));
    } else {
      hidableColumns.forEach(column => column.hide.set(false));
    }
  }, [deviceInfo.isMobile, deviceInfo.deviceBySize]);

  function closeDialogs(): void {
    pageState.merge({ 
      showDeleteDialog: false,
      showSingleDeleteDialog: false,
      showRestoreDialog: false,
      showDeleteAllDialog: false,
    });
  }

  async function deleteSingleFile() {
    const file = pageState.selectedFile.value;
    
    if (file == null) {
      throw new Error('Selected file cannot be null for deletion');
    }

    try {
      await documentSpaceService.deleteItems(file.spaceId, file.path, [file.key]);
      createTextToast(ToastType.SUCCESS, 'File deleted: ' + file.key);
    } catch (err) {
      createTextToast(ToastType.ERROR, 'Could not delete file ' + file.key);
    } finally {
      pageState.merge({
        shouldUpdateDatasource: true,
        selectedFile: undefined,
        datasource: documentSpaceService.createDatasource(
          '',
          '',
          infiniteScrollOptions,
          ArchivedStatus.ARCHIVED
        ),
      });

      closeDialogs();
    }
  }

  // performs the act of deleting items on the backend
  async function deleteFiles(files: DocumentDto[]): Promise<void> {
    try {
      const itemsToPurge = reduceDocumentDtoListToUnique(files);
      for (const item of itemsToPurge) {
        await documentSpaceService.deleteItems(item.spaceId, item.path, item.items);
      }
      createTextToast(ToastType.SUCCESS, 'Files Deleted');
    }
    catch (e) {
      createTextToast(ToastType.ERROR, 'Could not delete files - ' + (e as Error).toString());
    }

    pageState.merge({
      shouldUpdateDatasource: true,
      selectedFiles: [],
      datasource: documentSpaceService.createDatasource(
        '',
        '',
        infiniteScrollOptions,
        ArchivedStatus.ARCHIVED
      ),
    });
    closeDialogs();
  }

  // deletes selected files
  async function deleteSelectedFiles() {
    await deleteFiles(pageState.selectedFiles.get());
  }

  // deletes everything in archived (that the user has privs to delete)
  async function deleteAllItems(): Promise<void> {
    const rowData: DocumentDto[] = [];
    gridApi.current?.forEachNode(node => {
      if (checkHasWriteForDocSpace(node.data)) {
        rowData.push(node.data);
      }
    });
    await deleteFiles(rowData);

    // we've deleted (assumed successfully) all the items we had privs
    //  to delete, so disable the delete all button
    pageState.userCanDeleteSomethingArchived.set(false);
  }

  async function restoreItems(): Promise<void> {
    try {
      const itemsToRestore = reduceDocumentDtoListToUnique(pageState.selectedFiles.get());
      for (const item of itemsToRestore) {
        // for each item to restore, send the full path + item name to the backend
        //  it'll need the path in case there's >1 like-named file
        const listOfFilesWithPaths: string[] = [];
        for (const i of item.items) {
          // If the path to these files existed at the root level
          // then it doesn't need a trailing slash after the path
          if (item.path === '/') {
            listOfFilesWithPaths.push(item.path + i);
          } else {
            listOfFilesWithPaths.push(item.path + '/' + i);
          }
        }
        await documentSpaceService.unArchiveItems(item.spaceId, listOfFilesWithPaths);
      }
      createTextToast(ToastType.SUCCESS, 'Files Restored');
    }
    catch (e) {
      createTextToast(ToastType.ERROR, 'Could not restore files - ' + (e as Error).toString());
    }

    pageState.merge({
      shouldUpdateDatasource: true,
      selectedFiles: [],
      datasource: documentSpaceService.createDatasource(
        '',
        '',
        infiniteScrollOptions,
        ArchivedStatus.ARCHIVED
      ),
    });

    closeDialogs();
  }

  async function loadArchivedItems() {
    pageState.datasource.set(
      documentSpaceService.createDatasource('', '', infiniteScrollOptions, ArchivedStatus.ARCHIVED)
    );    
  }

  function onDatasourceUpdateCallback() {
    pageState.shouldUpdateDatasource.set(false);
  }

  function getDocumentUniqueKey(data: DocumentDto): string {
    return data.key;
  }

  function onDocumentRowSelected(data: DocumentDto, selectionEvent: GridSelectionType) {
    const selectedFiles = pageState.selectedFiles;
    if (selectionEvent === 'selected') {
      selectedFiles[selectedFiles.length].set(data);
    } else {
      selectedFiles.find((document) => document.key.value === data.key)?.set(none);
    }
  }

  function checkHasWriteForDocSpace(doc: DocumentDto): boolean {
    if (!doc) return false;
    if (docSpacePrivsState.isAuthorizedForAction(doc.spaceId, DocumentSpacePrivilegeDtoTypeEnum.Write)) {
      pageState.userCanDeleteSomethingArchived.set(true);
      return true;
    }
    return false;
  }

  return (
    <PageFormat pageTitle="Document Space Archived Items">
      {pageState.datasource.value && (
        <div>
        <div className="file-action-buttons">
          <Button
            className="file-action-button"
            type="button"
            icon
            disabled={pageState.selectedFiles.value.length === 0}
            data-testid="restore-selected-items"
            disableMobileFullWidth
            onClick={() => pageState.merge({ showRestoreDialog: true })}
          >
            <RestoreIcon iconTitle="Restore Selected" className="icon-color" size={1} />
          </Button>
          <Button
            className="file-action-button"
            type="button"
            icon
            disabled={pageState.selectedFiles.value.length === 0}
            data-testid="forever-delete-selected-items"
            disableMobileFullWidth
            onClick={() => pageState.merge({ showDeleteDialog: true })}
          >
            <RemoveIcon iconTitle="Purge Selected" className="icon-color" size={1} />
          </Button>
          <Button
            className="file-action-button"
            type="button"
            icon
            disabled={!pageState.userCanDeleteSomethingArchived.get()}
            data-testid="forever-delete-all-items"
            disableMobileFullWidth
            onClick={() => pageState.merge({ showDeleteAllDialog: true })}
          >
            <RemoveAllIcon iconTitle="Purge All Archived Items" className="icon-color" size={1} />
          </Button>
        </div>
        <FullPageInfiniteGrid
          onGridReady={(api) => {gridApi.current = api;}}
          columns={documentDtoColumns.attach(Downgraded).value}
          datasource={pageState.datasource.value}
          cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
          maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
          maxConcurrentDatasourceRequests={infiniteScrollOptions.maxConcurrentDatasourceRequests}
          suppressCellSelection
          updateDatasource={pageState.shouldUpdateDatasource.value}
          updateDatasourceCallback={onDatasourceUpdateCallback}
          getRowNodeId={getDocumentUniqueKey}
          onRowSelected={onDocumentRowSelected}
          suppressRowClickSelection
          rowSelection="multiple"
          autoResizeColumns
        />
        </div>
      )}
      <GenericDialog
        title="Delete Confirm"
        submitText="Delete Forever"
        show={pageState.showDeleteDialog.get()}
        onCancel={closeDialogs}
        onSubmit={deleteSelectedFiles}
      >
        {pageState.selectedFiles.get().length > 1
            ? `Delete these ${pageState.selectedFiles.get().length} items?`
            : `Delete this item - ${pageState.selectedFiles.get().map((item) => shortenString(item.key.toString())).join(',')}`}
      </GenericDialog>
      <GenericDialog
        title="Delete Confirm"
        submitText="Delete Forever"
        show={pageState.showSingleDeleteDialog.get()}
        onCancel={closeDialogs}
        onSubmit={deleteSingleFile}
        disableSubmit={pageState.selectedFile.value == null}
      >
        {
          pageState.selectedFile.value ?
          `Delete this item - ${shortenString(pageState.selectedFile.value.key)}`
          :
          'No item selected'
        }
      </GenericDialog>
      <GenericDialog
        title="Restore Confirm"
        submitText="Restore"
        show={pageState.showRestoreDialog.get()}
        onCancel={closeDialogs}
        onSubmit={restoreItems}
      >
        {pageState.selectedFiles.get().length > 1
            ? `Restore these ${pageState.selectedFiles.get().length} items?`
            : `Restore this item - ${pageState.selectedFiles.get().map((item) => shortenString(item.key.toString())).join(',')}`}
      </GenericDialog>
      <GenericDialog
        title="Delete All Confirm"
        submitText="Delete All"
        submitDanger={true}
        show={pageState.showDeleteAllDialog.get()}
        onCancel={closeDialogs}
        onSubmit={deleteAllItems}
      >
        Really delete all Archived Items?
      </GenericDialog>
    </PageFormat>
  );
}

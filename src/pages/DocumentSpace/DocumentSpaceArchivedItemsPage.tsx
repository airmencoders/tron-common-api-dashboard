import { Downgraded, none, useHookstate } from '@hookstate/core';
import { IDatasource, ValueFormatterParams } from 'ag-grid-community';
import { useEffect, useRef } from 'react';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import DocSpaceItemRenderer from '../../components/DocSpaceItemRenderer/DocSpaceItemRenderer';
import DocumentRowActionCellRenderer from '../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import { GridSelectionType } from '../../components/Grid/grid-selection-type';
import GridColumn from '../../components/Grid/GridColumn';
import { createDefaultGridFilterParamsForType, generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import InfiniteScrollGrid from '../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import PageFormat from '../../components/PageFormat/PageFormat';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import { DeviceSize, useDeviceInfo } from '../../hooks/PageResizeHook';
import CircleMinusIcon from '../../icons/CircleMinusIcon';
import CircleRightArrowIcon from '../../icons/CircleRightArrowIcon';
import { DocumentDto, DocumentSpacePrivilegeDtoTypeEnum } from '../../openapi';
import { ArchivedStatus } from '../../state/document-space/document-space-service';
import { useDocumentSpacePrivilegesState, useDocumentSpaceState } from '../../state/document-space/document-space-state';
import { formatDocumentSpaceDate } from '../../utils/date-utils';
import { formatBytesToString, reduceDocumentDtoListToUnique } from '../../utils/file-utils';
import DeleteDocumentDialog from './DocumentDelete';

interface PageState {
  datasource?: IDatasource;
  privilegeState: {
    privileges: Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>;
    isLoading: boolean;
  };
  shouldUpdateDatasource: boolean;
  selectedFiles: DocumentDto[];
  showDeleteDialog: boolean;
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
    privilegeState: {
      privileges: {
        READ: false,
        WRITE: false,
        MEMBERSHIP: false,
      },
      isLoading: false,
    },
    showDeleteDialog: false,
  });

  const documentDtoColumns = useHookstate<GridColumn[]>([
    new GridColumn({
      field: 'key',
      headerName: 'Name',
      resizable: true,
      cellRenderer: DocSpaceItemRenderer,
      checkboxSelection: true,
      sortable: true,
      filter: true,
    }),
    new GridColumn({
      field: 'spaceName',
      headerName: 'Doc Space',
      resizable: true,
      sortable: true,
      filter: true,
      valueGetter: (params) => (params.data as DocumentDto)?.spaceName ?? ''
    }),
    new GridColumn({
      field: 'path',
      headerName: 'Path',
      resizable: true,
      sortable: true,
      filter: true,      
    }),
    new GridColumn({
      field: 'lastModifiedDate',
      headerName: 'Last Modified',
      resizable: true,
      sortable: true,
      filter: 'agDateColumnFilter',
      valueGetter: (params) => new Date((params.data as DocumentDto)?.lastModifiedDate) ?? '',
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
      sortable: true,
      filter: true,
    }),
    new GridColumn({
      field: 'size',
      headerName: 'Size',
      resizable: true,
      sortable: true,
      filter: true,
      filterParams: createDefaultGridFilterParamsForType('number'),
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
            onClick: () => pageState.merge({ showDeleteDialog: true }),
            isAuthorized: (doc: DocumentDto) => checkHasWriteForDocSpace(doc),
          },
        ],
      },
    })
  ]);

  const deviceInfo = useDeviceInfo();

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

  function closeRemoveDialog(): void {
    pageState.merge({ showDeleteDialog: false });
  }

  // permanently deletes archived files
  async function deleteFile(): Promise<void> {
    try {
      const itemsToPurge = reduceDocumentDtoListToUnique(pageState.selectedFiles.get());
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
    closeRemoveDialog();
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
    return docSpacePrivsState.isAuthorizedForAction(doc.spaceId, DocumentSpacePrivilegeDtoTypeEnum.Write);
  }

  return (
    <PageFormat pageTitle="Document Space Archived Items">
      {pageState.datasource.value && (
        <InfiniteScrollGrid
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
          rowSelection="multiple"
          autoResizeColumns
        />
      )}
      <DeleteDocumentDialog
        show={pageState.showDeleteDialog.get()}
        onCancel={closeRemoveDialog}
        onSubmit={deleteFile}
        file={pageState.selectedFiles.get().map(item => item.key.toString()).join(',')}
      />
    </PageFormat>
  );
}

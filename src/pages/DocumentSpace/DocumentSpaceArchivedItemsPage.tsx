import { none, useHookstate } from '@hookstate/core';
import { IDatasource, ValueFormatterParams } from 'ag-grid-community';
import { useEffect, useRef } from 'react';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import DocSpaceItemRenderer from '../../components/DocSpaceItemRenderer/DocSpaceItemRenderer';
import DocumentRowActionCellRenderer from '../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import { GridSelectionType } from '../../components/Grid/grid-selection-type';
import GridColumn from '../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import InfiniteScrollGrid from '../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import PageFormat from '../../components/PageFormat/PageFormat';
import { ToastType } from '../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../components/Toast/ToastUtils/ToastUtils';
import CircleMinusIcon from '../../icons/CircleMinusIcon';
import CircleRightArrowIcon from '../../icons/CircleRightArrowIcon';
import { DocumentDto, DocumentSpacePrivilegeDtoTypeEnum } from '../../openapi';
import { ArchivedStatus } from '../../state/document-space/document-space-service';
import { useDocumentSpacePrivilegesState, useDocumentSpaceState } from '../../state/document-space/document-space-state';
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

const documentDtoColumns: GridColumn[] = [
  new GridColumn({
    field: 'key',
    headerName: 'Name',
    resizable: true,
    cellRenderer: DocSpaceItemRenderer,
    checkboxSelection: true,
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
];

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
  const documentSpaceService = useDocumentSpaceState();
  const docSpacePrivsState = useDocumentSpacePrivilegesState();
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    loadArchivedItems();

    return function cleanup() {
      mountedRef.current = false;
      documentSpaceService.resetState();
      docSpacePrivsState.resetState();    };
  }, []);

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
          listOfFilesWithPaths.push(item.path + '/' + i);
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

  function documentDtoColumnsWithMoreActions() {
    // get unique list of spaceIds we see here in the archived items...
    //  then see if this use can write or greater on each row -- which will determine if they get the 
    //  more actions or not
    if (!pageState.datasource.value) return documentDtoColumns;

    return [
      ...documentDtoColumns,
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
      }),
    ];
  }

  function checkHasWriteForDocSpace(doc: DocumentDto): boolean {
    if (!doc) return false;
    return docSpacePrivsState.isAuthorizedForAction(doc.spaceId, DocumentSpacePrivilegeDtoTypeEnum.Write);
  }

  return (
    <PageFormat pageTitle="Document Space Archived Items">
      {pageState.datasource.value && (
        <InfiniteScrollGrid
          columns={documentDtoColumnsWithMoreActions()}
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

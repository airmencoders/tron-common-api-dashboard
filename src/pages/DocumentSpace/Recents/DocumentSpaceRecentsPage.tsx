import { Downgraded, SetPartialStateAction, State, useHookstate } from '@hookstate/core';
import { IDatasource, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import React, { useEffect, useRef } from 'react';
import BreadCrumbTrail from '../../../components/BreadCrumbTrail/BreadCrumbTrail';
import { InfiniteScrollOptions } from '../../../components/DataCrudFormPage/infinite-scroll-options';
import DocumentRowActionCellRenderer
  from '../../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import GridColumn from '../../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../../components/Grid/GridUtils/grid-utils';
import InfiniteScrollGrid from '../../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import PageFormat from '../../../components/PageFormat/PageFormat';
import { ToastType } from '../../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../../components/Toast/ToastUtils/ToastUtils';
import {
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceResponseDto,
  RecentDocumentDto,
} from '../../../openapi';
import { useAuthorizedUserState } from '../../../state/authorized-user/authorized-user-state';
import { useDocumentSpacePrivilegesState, useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import { PrivilegeType } from '../../../state/privilege/privilege-type';
import '../DocumentSpacePage.scss';
import { formatDocumentSpaceDate } from '../../../utils/date-utils'
import { CancellableDataRequest } from '../../../utils/cancellable-data-request';
import RecentDocumentDownloadCellRenderer from './RecentDocumentDownloadCellRenderer';
import DeleteDocumentDialog from '../DocumentDelete';
import Spinner from '../../../components/Spinner/Spinner';
import RecentDocumentCellRenderer from './RecentDocumentCellRenderer';
import StarIcon from '../../../icons/StarIcon';
import CircleMinusIcon from '../../../icons/CircleMinusIcon';
import EditIcon from '../../../icons/EditIcon';
import UploadIcon from '../../../icons/UploadIcon';
import { DeviceSize, useDeviceInfo } from '../../../hooks/PageResizeHook';

const infiniteScrollOptions: InfiniteScrollOptions = {
  enabled: true,
  limit: 100,
};

interface DocumentSpaceRecentsPageState {
  datasource?: IDatasource;
  shouldUpdateInfiniteCache: boolean;
  selectedFile?: RecentDocumentDto;
  showDeleteDialog: boolean;
}

function getDocumentUniqueKey(data: RecentDocumentDto): string {
  return data.id;
}

function DocumentSpaceRecentsPage() {
  const documentSpaceService = useDocumentSpaceState();
  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const authorizedUserService = useAuthorizedUserState();

  const pageState = useHookstate<DocumentSpaceRecentsPageState>({
    datasource: undefined,
    shouldUpdateInfiniteCache: false,
    selectedFile: undefined,
    showDeleteDialog: false,
  });

  const recentDocumentDtoColumns = useHookstate<GridColumn[]>([
    new GridColumn({
      field: 'key',
      headerName: 'Name',
      resizable: true,
      cellRenderer: RecentDocumentCellRenderer,
    }),
    new GridColumn({
      headerName: 'Document Space',
      resizable: true,
      valueGetter: function getDocumentSpaceName(params: ValueGetterParams) {
        return params.data?.documentSpace?.name || '';
      }
    }),
    new GridColumn({
      field: 'lastModifiedDate',
      valueFormatter: function (params: ValueFormatterParams) {
        if (params.value) {
          return formatDocumentSpaceDate(params.value);
        }
      },
      headerName: 'Last Modified',
      resizable: true,
    }),
    new GridColumn({
      valueGetter: GridColumn.defaultValueGetter,
      headerName: 'Download',
      headerClass: 'header-center',
      resizable: true,
      cellRenderer: RecentDocumentDownloadCellRenderer
    }),
    new GridColumn({
      valueGetter: GridColumn.defaultValueGetter,
      headerName: 'More',
      headerClass: 'header-center',
      cellRenderer: DocumentRowActionCellRenderer,
      cellRendererParams: {
        menuItems: [
          { title: 'Add to favorites', icon: StarIcon, onClick: () => console.log('add to favorites'), isAuthorized: () => true },
          {
            title: 'Remove',
            icon: CircleMinusIcon,
            onClick: (doc: RecentDocumentDto) => {
              mergePageState({ selectedFile: doc, showDeleteDialog: true })
            },
            isAuthorized: (data: RecentDocumentDto) => {
              return data && documentSpacePrivilegesService.isAuthorizedForAction(data.documentSpace.id, DocumentSpacePrivilegeDtoTypeEnum.Write);
            }
          },
          { title: 'Rename', icon: EditIcon, onClick: () => console.log('rename'), isAuthorized: () => true },
          { title: 'Upload new version', icon: UploadIcon, onClick: () => console.log('upload'), isAuthorized: () => true },
        ],
      }
    })
  ]);

  const deviceInfo = useDeviceInfo();

  const isAdmin = authorizedUserService.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN);

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    let spacesCancellableRequest: CancellableDataRequest<DocumentSpaceResponseDto[]>;
    let privilegesCancellableRequest: CancellableDataRequest<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>;

    // Don't need to load privileges if current user is Dashboard Admin,
    // since they currently have access to everything Document Space related
    if (!isAdmin) {
      spacesCancellableRequest = documentSpaceService.fetchAndStoreSpaces();
      spacesCancellableRequest.promise
        .then(response => {
          privilegesCancellableRequest = documentSpacePrivilegesService.fetchAndStoreDashboardUserDocumentSpacesPrivileges(new Set(response.map(item => item.id)));
          return privilegesCancellableRequest.promise;
        })
        .catch(err => {
          if (!mountedRef.current) {
            return;
          }

          createTextToast(ToastType.ERROR, 'Could not load privileges for authorized Document Spaces. Actions will be limited', { autoClose: false });
        })
        .then(() => mergePageState({
          datasource: documentSpaceService.createRecentDocumentsDatasource(infiniteScrollOptions)
        }));
    } else {
      mergePageState({
        datasource: documentSpaceService.createRecentDocumentsDatasource(infiniteScrollOptions)
      });
    }

    return function cleanup() {
      mountedRef.current = false;

      if (spacesCancellableRequest != null) {
        spacesCancellableRequest.cancelTokenSource.cancel();
      }

      if (privilegesCancellableRequest != null) {
        privilegesCancellableRequest.cancelTokenSource.cancel();
      }

      documentSpaceService.resetState();
      documentSpacePrivilegesService.resetState();
    };
  }, []);

  // Handle hiding columns on resize
  useEffect(() => {
    const hideableColumns = recentDocumentDtoColumns.filter(column => 
      column.field.value !== 'key' &&
      column.field.value !== 'lastModifiedDate' &&
      column.headerName.value !== 'Document Space' &&
      column.headerName.value !== 'More'
    );

    if (deviceInfo.isMobile || deviceInfo.deviceBySize <= DeviceSize.TABLET) {
      hideableColumns.forEach(column => column.hide.set(true));
    } else {
      hideableColumns.forEach(column => column.hide.set(false));
    }
  }, [deviceInfo.isMobile, deviceInfo.deviceBySize]);

  async function deleteArchiveFile() {
    const file = pageState.selectedFile.value;

    if (file == null) {
      throw new Error('File cannot be null for File Archive Deletion');
    }

    try {
      await documentSpaceService.deleteArchiveItemBySpaceAndParent(file.documentSpace.id, file.parentFolderId, file.key);
    } catch (error) {
      createTextToast(ToastType.ERROR, 'Could not delete requested file: ' + file.key);
    } finally {
      mergePageState({
        selectedFile: undefined,
        showDeleteDialog: false,
        shouldUpdateInfiniteCache: true
      });
    }
  }

  function mergePageState(partialState: Partial<DocumentSpaceRecentsPageState>): void {
    mergeState<DocumentSpaceRecentsPageState>(pageState, partialState);
  }

  function mergeState<T>(state: State<T>, partialState: SetPartialStateAction<T>): void {
    if (mountedRef.current) {
      state.merge(partialState);
    }
  }

  function shouldUpdateInfiniteCacheCallback() {
    mergePageState({
      shouldUpdateInfiniteCache: false
    });
  }

  return (
    <PageFormat pageTitle="Recently Uploaded">
      {documentSpaceService.isDocumentSpacesStatePromised ?
        <Spinner /> :
        <>
          <div className="breadcrumb-area">
            <BreadCrumbTrail
              path=""
              onNavigate={() => { return }}
              rootName="Recents"
            />
          </div>
          {pageState.datasource.value &&
            <InfiniteScrollGrid
              columns={recentDocumentDtoColumns.attach(Downgraded).value}
              datasource={pageState.datasource.value}
              cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
              maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
              maxConcurrentDatasourceRequests={infiniteScrollOptions.maxConcurrentDatasourceRequests}
              suppressCellSelection
              suppressRowClickSelection
              getRowNodeId={getDocumentUniqueKey}
              updateInfiniteCache={pageState.shouldUpdateInfiniteCache.value}
              updateInfiniteCacheCallback={shouldUpdateInfiniteCacheCallback}
              autoResizeColumns
            />
          }

          <DeleteDocumentDialog
            show={pageState.showDeleteDialog.get()}
            onCancel={() => pageState.showDeleteDialog.set(false)}
            onSubmit={deleteArchiveFile}
            file={pageState.selectedFile.value?.key ?? null}
          />
        </>
      }
    </PageFormat>
  );
}

export default DocumentSpaceRecentsPage;

import { SetPartialStateAction, State, useHookstate } from '@hookstate/core';
import { IDatasource, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import React, { useEffect, useRef } from 'react';
import BreadCrumbTrail from '../../../components/BreadCrumbTrail/BreadCrumbTrail';
import Button from '../../../components/Button/Button';
import { InfiniteScrollOptions } from '../../../components/DataCrudFormPage/infinite-scroll-options';
import DocumentRowActionCellRenderer
  from '../../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import GridColumn from '../../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../../components/Grid/GridUtils/grid-utils';
import InfiniteScrollGrid from '../../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import PageFormat from '../../../components/PageFormat/PageFormat';
import { ToastType } from '../../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../../components/Toast/ToastUtils/ToastUtils';
import RemoveIcon from '../../../icons/RemoveIcon';
import {
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceResponseDto,
  RecentDocumentDto,
} from '../../../openapi';
import { useAuthorizedUserState } from '../../../state/authorized-user/authorized-user-state';
import { useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import { PrivilegeType } from '../../../state/privilege/privilege-type';
import '../DocumentSpacePage.scss';
import { format } from 'date-fns';
import { CancellableDataRequest } from '../../../utils/cancellable-data-request';
import RecentDocumentDownloadCellRenderer from './RecentDocumentDownloadCellRenderer';
import DeleteDocumentDialog from '../DocumentDelete';
import Spinner from '../../../components/Spinner/Spinner';
import RecentDocumentCellRenderer from './RecentDocumentCellRenderer';

const recentDocumentDtoColumns: GridColumn[] = [
  new GridColumn({
    field: 'key',
    headerName: 'Name',
    resizable: true,
    cellRenderer: RecentDocumentCellRenderer,
    checkboxSelection: true
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
      return params.value && format(new Date(params.value), 'dd MMM yyyy hh:mm aa');
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
  })
];

const infiniteScrollOptions: InfiniteScrollOptions = {
  enabled: true,
  limit: 100,
};

interface DocumentSpaceRecentsPageState {
  shouldUpdateDatasource: boolean;
  datasource?: IDatasource;
  fileToDelete: string;
  selectedFile?: RecentDocumentDto;
  privilegeState: {
    /**
     * Will take the form of:
     * {
     *    [documentSpaceId]: {
     *      READ: false,
     *      WRITE: false,
     *      MEMBERSHIP: false
     *    }
     * }
     */
    privileges: Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>,
    isLoading: boolean
  };
  showDeleteDialog: boolean;
}

function getDocumentUniqueKey(data: RecentDocumentDto): string {
  return data.id;
}

function DocumentSpaceRecentsPage() {
  const documentSpaceService = useDocumentSpaceState();
  const authorizedUserService = useAuthorizedUserState();

  const pageState = useHookstate<DocumentSpaceRecentsPageState>({
    shouldUpdateDatasource: false,
    datasource: undefined,
    fileToDelete: '',
    selectedFile: undefined,
    privilegeState: {
      privileges: {},
      isLoading: false
    },
    showDeleteDialog: false,
  });

  const isAdmin = authorizedUserService.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN);

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    let spacesCancellableRequest: CancellableDataRequest<DocumentSpaceResponseDto[]>;

    // Don't need to load privileges if current user is Dashboard Admin,
    // since they currently have access to everything Document Space related
    if (!isAdmin) {
      spacesCancellableRequest = documentSpaceService.fetchAndStoreSpaces();
      spacesCancellableRequest.promise
        .then(response => getPrivilegesForEachDocumentSpace(response))
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

      documentSpaceService.resetState();
    };
  }, []);

  async function getPrivilegesForEachDocumentSpace(documentSpaces: DocumentSpaceResponseDto[]) {
    let privileges: Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>> = {};

    mergeState(pageState.privilegeState, {
      isLoading: true
    });

    try {
      privileges = await documentSpaceService.getDashboardUserPrivilegesForDocumentSpaces(new Set(documentSpaces.map(item => item.id)));

      mergePageState({
        privilegeState: {
          privileges,
          isLoading: false
        },
      });
    } catch (err) {
      if (!mountedRef.current) {
        return;
      }

      console.log("thrown here")
      createTextToast(ToastType.ERROR, 'Could not load privileges for authorized Document Spaces. Actions will be limited', { autoClose: false });

      mergePageState({
        privilegeState: {
          privileges: {},
          isLoading: false
        }
      });
    }
  }

  async function deleteFile() {
    const file = pageState.selectedFile.value;

    if (file == null) {
      throw new Error('File cannot be null for File Deletion');
    }

    try {
      await documentSpaceService.deleteFileBySpaceAndParent(file.documentSpace.id, file.parentFolderId, file.key);
    } catch (error) {
      createTextToast(ToastType.ERROR, 'Could not delete requested file: ' + file.key);
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

  function onSelectionChanged(data?: RecentDocumentDto) {
    pageState.selectedFile.set(data);
  }

  function isAuthorizedForAction(documentSpaceId: string, actionType: DocumentSpacePrivilegeDtoTypeEnum) {
    if (isAdmin) {
      return true;
    }

    const privilegesForDocumentSpace = pageState.privilegeState.privileges.value[documentSpaceId];
    return privilegesForDocumentSpace && privilegesForDocumentSpace[actionType];
  }

  function documentDtoColumnsWithConditionalDelete() {
    return [
      ...recentDocumentDtoColumns,
      new GridColumn({
        valueGetter: GridColumn.defaultValueGetter,
        headerName: 'More',
        headerClass: 'header-center',
        cellRenderer: DocumentRowActionCellRenderer,
        cellRendererParams: {
          actions: {
            delete: {
              action: (doc: RecentDocumentDto) => {
                pageState.merge({ selectedFile: doc, showDeleteDialog: true })
              },
              isAuthorized: (data: RecentDocumentDto) => {
                return data && isAuthorizedForAction(data.documentSpace.id, DocumentSpacePrivilegeDtoTypeEnum.Write);
              }
            }
          }
        }
      })
    ];
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
            <div>
              {!pageState.privilegeState.isLoading.value && (
                <div className="content-controls">
                  <Button
                    type="button"
                    icon
                    disabled={!pageState.selectedFile.value ||
                      !isAuthorizedForAction(pageState.selectedFile.value.documentSpace.id, DocumentSpacePrivilegeDtoTypeEnum.Write)}
                    data-testid="delete-selected-items"
                    disableMobileFullWidth
                    onClick={() => pageState.showDeleteDialog.set(true)}
                  >
                    <RemoveIcon className="icon-color" size={1.25} />
                  </Button>
                </div>
              )}
            </div>
          </div>
          {pageState.datasource.value &&
            <InfiniteScrollGrid
              columns={documentDtoColumnsWithConditionalDelete()}
              datasource={pageState.datasource.value}
              cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
              maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
              maxConcurrentDatasourceRequests={infiniteScrollOptions.maxConcurrentDatasourceRequests}
              suppressCellSelection
              getRowNodeId={getDocumentUniqueKey}
              rowSelection="single"
              onSelectionChanged={onSelectionChanged}
            />
          }

          <DeleteDocumentDialog
            show={pageState.showDeleteDialog.get()}
            onCancel={() => pageState.showDeleteDialog.set(false)}
            onSubmit={deleteFile}
            file={pageState.selectedFile.value?.key ?? null}
          />
        </>
      }
    </PageFormat>
  );
}

export default DocumentSpaceRecentsPage;

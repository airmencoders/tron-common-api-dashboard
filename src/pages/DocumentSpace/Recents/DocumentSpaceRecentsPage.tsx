import { Downgraded, none, State, useHookstate } from '@hookstate/core';
import { IDatasource, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import React, { useEffect, useRef } from 'react';
import BreadCrumbTrail from '../../../components/BreadCrumbTrail/BreadCrumbTrail';
import Button from '../../../components/Button/Button';
import { InfiniteScrollOptions } from '../../../components/DataCrudFormPage/infinite-scroll-options';
import DocumentRowActionCellRenderer
, { PopupMenuItem }  from '../../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
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
import { useDocumentSpacePrivilegesState, useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import { PrivilegeType } from '../../../state/privilege/privilege-type';
import '../DocumentSpacePage.scss';
import { formatDocumentSpaceDate } from '../../../utils/date-utils'
import { CancellableDataRequest } from '../../../utils/cancellable-data-request';
import RecentDocumentDownloadCellRenderer from './RecentDocumentDownloadCellRenderer';
import DeleteDocumentDialog from '../DocumentDelete';
import Spinner from '../../../components/Spinner/Spinner';
import RecentDocumentCellRenderer from './RecentDocumentCellRenderer';
import CircleMinusIcon from '../../../icons/CircleMinusIcon';
import EditIcon from '../../../icons/EditIcon';
import { DeviceSize, useDeviceInfo } from '../../../hooks/PageResizeHook';
import { performActionWhenMounted } from '../../../utils/component-utils';
import SideDrawer from '../../../components/SideDrawer/SideDrawer';
import { CreateEditOperationType, getCreateEditTitle } from '../../../state/document-space/document-space-utils';
import { SideDrawerSize } from '../../../components/SideDrawer/side-drawer-size';
import DocumentSpaceCreateEditForm from '../DocumentSpaceCreateEditForm';
import DownloadMaterialIcon from '../../../icons/DownloadMaterialIcon';

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

interface RenameFormState {
  isSubmitting: boolean;
  isOpen: boolean;
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

  const renameFormState = useHookstate<RenameFormState>({
    isSubmitting: false,
    isOpen: false
  });

  const recentDocumentDtoColumns = useHookstate<GridColumn[]>([
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
          {
            title: 'Remove',
            icon: CircleMinusIcon,
            onClick: (doc: RecentDocumentDto) => {
              performActionWhenMounted(mountedRef.current, () => pageState.merge({ selectedFile: doc, showDeleteDialog: true }))
            },
            isAuthorized: (data: RecentDocumentDto) => {
              return data && documentSpacePrivilegesService.isAuthorizedForAction(data.documentSpace.id, DocumentSpacePrivilegeDtoTypeEnum.Write);
            }
          },
          { 
            title: 'Rename',
            icon: EditIcon,
            onClick: (doc: RecentDocumentDto) => {
              performActionWhenMounted(mountedRef.current, () => {
                pageState.selectedFile.set(doc);
                renameFormState.isOpen.set(true);
              })
            },
            isAuthorized: (data: RecentDocumentDto) => {
              return data && documentSpacePrivilegesService.isAuthorizedForAction(data.documentSpace.id, DocumentSpacePrivilegeDtoTypeEnum.Write);
            }
          },
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
          performActionWhenMounted(mountedRef.current, () => 
            createTextToast(ToastType.ERROR, 'Could not load privileges for authorized Document Spaces. Actions will be limited', { autoClose: false }));
        })
        .then(() => performActionWhenMounted(mountedRef.current, () => pageState.datasource.set(documentSpaceService.createRecentDocumentsDatasource(infiniteScrollOptions))))
    } else {
      performActionWhenMounted(mountedRef.current, () => pageState.datasource.set(documentSpaceService.createRecentDocumentsDatasource(infiniteScrollOptions)));
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

    // Get the "More" actions column
    const moreActionsColumn = recentDocumentDtoColumns.find(column => column.headerName.value === 'More');
    // Cell Renderer Params for "More" actions column
    const cellRendererParams = (moreActionsColumn?.cellRendererParams as State<{ menuItems: PopupMenuItem<RecentDocumentDto>[] }>);
    const downloadAction = cellRendererParams.menuItems.find(menuItem => menuItem.title.value === 'Download');

    if (deviceInfo.isMobile || deviceInfo.deviceBySize <= DeviceSize.TABLET) {
      hideableColumns.forEach(column => column.hide.set(true));
      
      // Only add Download if it doesn't exist already
      if (downloadAction == null) {
        cellRendererParams.set(state => {
          state.menuItems.splice(0, 0, { 
            title: 'Download', 
            icon: DownloadMaterialIcon,
            iconProps: {
              style: 'primary',
              fill: true
            },
            shouldShow: (doc: RecentDocumentDto) => doc != null,
            isAuthorized: () => true,
            onClick: (doc: RecentDocumentDto) => 
              window.location.href = documentSpaceService.createRelativeDownloadFileUrlBySpaceAndParent(doc.documentSpace.id , doc.parentFolderId, doc.key, true)
          });
  
          return state;
        });
      }
    } else {
      hideableColumns.forEach(column => column.hide.set(false));

      // Remove Download if it exists
      downloadAction?.set(none);
    }
  }, [deviceInfo.isMobile, deviceInfo.deviceBySize]);

  async function deleteArchiveFile() {
    const file = pageState.selectedFile.value;

    if (file == null) {
      throw new Error('File cannot be null for File Archive Deletion');
    }

    try {
      await documentSpaceService.deleteArchiveItemBySpaceAndParent(file.documentSpace.id, file.parentFolderId, file.key);
      performActionWhenMounted(mountedRef.current, () => createTextToast(ToastType.SUCCESS, 'File successfully archived: ' + file.key));
    } catch (error) {
      performActionWhenMounted(mountedRef.current, () => createTextToast(ToastType.ERROR, 'Could not delete requested file: ' + file.key));
    } finally {
      performActionWhenMounted(mountedRef.current, () => pageState.merge({
        selectedFile: undefined,
        showDeleteDialog: false,
        shouldUpdateInfiniteCache: true
      }));
    }
  }

  async function renameFile(newName: string) {
    const file = pageState.selectedFile.value;

    if (file == null) {
      throw new Error('File cannot be null for File Rename');
    }
    
    let wasSuccessful = false;

    try {
      performActionWhenMounted(mountedRef.current, () => renameFormState.isSubmitting.set(true));
      
      const pathToFolderContainingFile = await documentSpaceService.getDocumentSpaceEntryPath(file.documentSpace.id, file.parentFolderId);
      await documentSpaceService.renameFile(file.documentSpace.id, pathToFolderContainingFile, file.key, newName);

      wasSuccessful = true;
      performActionWhenMounted(mountedRef.current, () => createTextToast(ToastType.SUCCESS, `Successfully renamed file ${file.key} to ${newName}`));
    } catch (error) {
      performActionWhenMounted(mountedRef.current, () => createTextToast(ToastType.ERROR, `Could not rename file ${file.key}`));
    } finally {
      performActionWhenMounted(mountedRef.current, () => {
        if (wasSuccessful) {
          pageState.merge({
            shouldUpdateInfiniteCache: true,
            selectedFile: undefined
          });
        } else {
          pageState.selectedFile.set(undefined);
        }

        renameFormState.merge({
          isOpen: false,
          isSubmitting: false
        });
      });
    }
  }

  function closeRenameForm() {
    pageState.selectedFile.set(undefined);
    renameFormState.merge({
      isSubmitting: false,
      isOpen: false
    });
  }

  function onSelectionChanged(data?: RecentDocumentDto) {
    pageState.selectedFile.set(data);
  }

  function shouldUpdateInfiniteCacheCallback() {
    performActionWhenMounted(mountedRef.current, () => pageState.shouldUpdateInfiniteCache.set(false));
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
              {!documentSpacePrivilegesService.isPromised && (
                <div className="content-controls">
                  <Button
                    type="button"
                    icon
                    disabled={!pageState.selectedFile.value ||
                      !documentSpacePrivilegesService.isAuthorizedForAction(pageState.selectedFile.value.documentSpace.id, DocumentSpacePrivilegeDtoTypeEnum.Write)}
                    data-testid="delete-selected-items"
                    disableMobileFullWidth
                    onClick={() => pageState.showDeleteDialog.set(true)}
                  >
                    <RemoveIcon className="icon-color" size={1} />
                  </Button>
                </div>
              )}
            </div>
          </div>
          {pageState.datasource.value &&
            <InfiniteScrollGrid
              columns={recentDocumentDtoColumns.attach(Downgraded).value}
              datasource={pageState.datasource.value}
              cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
              maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
              maxConcurrentDatasourceRequests={infiniteScrollOptions.maxConcurrentDatasourceRequests}
              suppressCellSelection
              getRowNodeId={getDocumentUniqueKey}
              rowSelection="single"
              onSelectionChanged={onSelectionChanged}
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

          <SideDrawer
            isLoading={false}
            title={getCreateEditTitle(CreateEditOperationType.EDIT_FILENAME)}
            isOpen={renameFormState.isOpen.value && pageState.selectedFile.value != null}
            onCloseHandler={closeRenameForm}
            size={SideDrawerSize.NORMAL}
          >
            {pageState.selectedFile.value &&
              <DocumentSpaceCreateEditForm
                onCancel={closeRenameForm}
                onSubmit={renameFile}
                isFormSubmitting={renameFormState.isSubmitting.value}
                onCloseErrorMsg={() => { return; }}
                showErrorMessage={false}
                elementName={pageState.selectedFile.value?.key}
                opType={CreateEditOperationType.EDIT_FILENAME}
              />
            }
          </SideDrawer>
        </>
      }
    </PageFormat>
  );
}

export default DocumentSpaceRecentsPage;

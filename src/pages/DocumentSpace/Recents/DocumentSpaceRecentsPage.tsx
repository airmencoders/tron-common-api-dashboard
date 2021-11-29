import { Downgraded, State, useHookstate } from '@hookstate/core';
import { ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import React, { useEffect, useRef } from 'react';
import BreadCrumbTrail from '../../../components/BreadCrumbTrail/BreadCrumbTrail';
import { InfiniteScrollOptions } from '../../../components/DataCrudFormPage/infinite-scroll-options';
import DocumentRowActionCellRenderer
, { PopupMenuItem }  from '../../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import GridColumn from '../../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../../components/Grid/GridUtils/grid-utils';
import InfiniteScrollGrid from '../../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import PageFormat from '../../../components/PageFormat/PageFormat';
import {
  DocumentSpacePrivilegeDtoTypeEnum,
  RecentDocumentDto,
} from '../../../openapi';
import { documentSpaceDownloadUrlService, useDocumentSpaceRecentsPageState } from '../../../state/document-space/document-space-state';
import '../DocumentSpacePage.scss';
import { formatDocumentSpaceDate } from '../../../utils/date-utils'
import RecentDocumentDownloadCellRenderer from './RecentDocumentDownloadCellRenderer';
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
import ArchiveDialog from '../../../components/documentspace/ArchiveDialog/ArchiveDialog';

const infiniteScrollOptions: InfiniteScrollOptions = {
  enabled: true,
  limit: 100,
};

function getDocumentUniqueKey(data: RecentDocumentDto): string {
  return data.id;
}

function DocumentSpaceRecentsPage() {
  const mountedRef = useRef(false);

  const deviceInfo = useDeviceInfo();

  const downloadUrlService = documentSpaceDownloadUrlService();
  const documentSpaceRecentsPageService = useDocumentSpaceRecentsPageState(mountedRef);

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
          { 
            title: 'Download', 
            icon: DownloadMaterialIcon,
            iconProps: {
              style: 'primary',
              fill: true
            },
            shouldShow: (doc: RecentDocumentDto) => doc != null && isMobileLayout(),
            isAuthorized: () => true,
            onClick: (doc: RecentDocumentDto) => 
              window.location.href = downloadUrlService.createRelativeDownloadFileUrlBySpaceAndParent(doc.documentSpace.id , doc.parentFolderId, doc.key, true)
          },
          {
            title: 'Remove',
            icon: CircleMinusIcon,
            onClick: (doc: RecentDocumentDto) => {
              performActionWhenMounted(mountedRef.current, () => documentSpaceRecentsPageService.recentsState.merge({ selectedFile: doc, showDeleteDialog: true }))
            },
            isAuthorized: (data: RecentDocumentDto) => documentSpaceRecentsPageService.isAuthorizedForAction(data, DocumentSpacePrivilegeDtoTypeEnum.Write)
          },
          { 
            title: 'Rename',
            icon: EditIcon,
            onClick: (doc: RecentDocumentDto) => {
              performActionWhenMounted(mountedRef.current, () => {
                documentSpaceRecentsPageService.recentsState.merge({
                  selectedFile: doc,
                  renameFormState: {
                    isOpen: true,
                    isSubmitting: false
                  }
                });
              })
            },
            isAuthorized: (data: RecentDocumentDto) => documentSpaceRecentsPageService.isAuthorizedForAction(data, DocumentSpacePrivilegeDtoTypeEnum.Write)
          },
        ],
      }
    })
  ]);

  useEffect(() => {
    mountedRef.current = true;

    documentSpaceRecentsPageService.fetchSpacesAndPrivileges(infiniteScrollOptions);

    return function cleanup() {
      mountedRef.current = false;

      documentSpaceRecentsPageService.resetState();
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

    if (isMobileLayout()) {
      hideableColumns.forEach(column => column.hide.set(true));
      
      downloadAction?.set(state => {
        state.shouldShow = (doc: RecentDocumentDto) => doc != null;
        return state;
      });
    } else {
      hideableColumns.forEach(column => column.hide.set(false));

      downloadAction?.set(state => {
        state.shouldShow = () => false;
        return state;
      });
    }

    cellRendererParams.set(state => {
      // Need to copy the array so that the cell renderer recalculates
      // the items properly
      state.menuItems = [...state.menuItems];
      return state;
    });
  }, [deviceInfo.isMobile, deviceInfo.deviceBySize]);

  function isMobileLayout() {
    return deviceInfo.isMobile || deviceInfo.deviceBySize <= DeviceSize.TABLET;
  }

  function closeRenameForm() {
    documentSpaceRecentsPageService.recentsState.merge({
      selectedFile: undefined,
      renameFormState: {
        isSubmitting: false,
        isOpen: false
      }
    })
  }

  function shouldUpdateInfiniteCacheCallback() {
    performActionWhenMounted(mountedRef.current, () => documentSpaceRecentsPageService.recentsState.shouldUpdateInfiniteCache.set(false));
  }

  return (
    <PageFormat pageTitle="Recently Uploaded">
      {documentSpaceRecentsPageService.isSpacesOrPrivilegesLoading() ?
        <Spinner /> :
        <>
          <div className="breadcrumb-area">
            <BreadCrumbTrail
              path=""
              onNavigate={() => { return; }}
              rootName="Recents"
            />
          </div>
          {documentSpaceRecentsPageService.recentsState.datasource.value &&
            <InfiniteScrollGrid
              columns={recentDocumentDtoColumns.attach(Downgraded).value}
              datasource={documentSpaceRecentsPageService.recentsState.datasource.value}
              cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
              maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
              maxConcurrentDatasourceRequests={infiniteScrollOptions.maxConcurrentDatasourceRequests}
              suppressCellSelection
              suppressRowClickSelection
              getRowNodeId={getDocumentUniqueKey}
              updateInfiniteCache={documentSpaceRecentsPageService.recentsState.shouldUpdateInfiniteCache.value}
              updateInfiniteCacheCallback={shouldUpdateInfiniteCacheCallback}
              autoResizeColumns
              forceCellRefreshOnResize
            />
          }

          <ArchiveDialog
            show={documentSpaceRecentsPageService.recentsState.showDeleteDialog.value}
            onCancel={() => documentSpaceRecentsPageService.recentsState.showDeleteDialog.set(false)}
            onSubmit={documentSpaceRecentsPageService.deleteArchiveFile.bind(documentSpaceRecentsPageService)}
            items={documentSpaceRecentsPageService.recentsState.selectedFile.value}
          />

          <SideDrawer
            isLoading={false}
            title={getCreateEditTitle(CreateEditOperationType.EDIT_FILENAME)}
            isOpen={documentSpaceRecentsPageService.recentsState.renameFormState.isOpen.value && documentSpaceRecentsPageService.recentsState.selectedFile.value != null}
            onCloseHandler={closeRenameForm}
            size={SideDrawerSize.NORMAL}
          >
            {documentSpaceRecentsPageService.recentsState.selectedFile.value &&
              <DocumentSpaceCreateEditForm
                onCancel={closeRenameForm}
                onSubmit={documentSpaceRecentsPageService.renameFile.bind(documentSpaceRecentsPageService)}
                isFormSubmitting={documentSpaceRecentsPageService.recentsState.renameFormState.isSubmitting.value}
                onCloseErrorMsg={() => { return; }}
                showErrorMessage={false}
                elementName={documentSpaceRecentsPageService.recentsState.selectedFile.value?.key}
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

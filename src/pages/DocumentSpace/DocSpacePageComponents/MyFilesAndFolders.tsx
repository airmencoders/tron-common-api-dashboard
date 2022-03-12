import { Downgraded, State, useHookstate } from '@hookstate/core';
import { ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import BreadCrumbTrail from '../../../components/BreadCrumbTrail/BreadCrumbTrail';
import DocSpaceItemRenderer from '../../../components/DocSpaceItemRenderer/DocSpaceItemRenderer';
import DocumentRowActionCellRenderer, { PopupMenuItem } from '../../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import DocumentSpaceActions from '../../../components/documentspace/Actions/DocumentSpaceActions';
import FullPageInfiniteGrid from '../../../components/Grid/FullPageInifiniteGrid/FullPageInfiniteGrid';
import GridColumn from '../../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../../components/Grid/GridUtils/grid-utils';
import { ToastType } from '../../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../../components/Toast/ToastUtils/ToastUtils';
import { DeviceSize, useDeviceInfo } from '../../../hooks/PageResizeHook';
import CircleMinusIcon from '../../../icons/CircleMinusIcon';
import CopyContentIcon from '../../../icons/CopyContentIcon';
import CutIcon from '../../../icons/CutIcon';
import EditIcon from '../../../icons/EditIcon';
import InfoIcon from '../../../icons/InfoIcon';
import StarHollowIcon from '../../../icons/StarHollowIcon';
import StarIcon from '../../../icons/StarIcon';
import { DocumentDto, DocumentSpacePrivilegeDtoTypeEnum } from '../../../openapi';
import { clipBoardState, useDocumentSpacePrivilegesState } from '../../../state/document-space/document-space-state';
import SpacesPageService from '../../../state/document-space/spaces-page/spaces-page-service';
import { formatDocumentSpaceDate } from '../../../utils/date-utils';
import { CreateEditOperationType } from '../../../utils/document-space-utils';
import { formatBytesToString, joinPathParts } from '../../../utils/file-utils';
import DocumentDownloadCellRenderer from '../DocumentDownloadCellRenderer';
import { DocumentSpacePageTabEnum } from '../DocumentSpacePage';
import { pathQueryKey, spaceIdQueryKey } from '../DocumentSpaceSelector';

export interface MyFilesAndFoldersProps {
  pageService: SpacesPageService;
  tabState?: State<DocumentSpacePageTabEnum>;
}

export function formatAgGridDateCell(params: ValueFormatterParams): string {
  if (params.value) {
    return formatDocumentSpaceDate(params.value);
  }

  return "";
}

/**
 * This component basically just helps declutter an otherwise overly-bloated DocumentSpacePage
 * component... it specifically houses the regular, document/folder browsing grid and logic
 */

export default function MyFilesAndFolders({ pageService }: MyFilesAndFoldersProps) {
  const location = useLocation();
  const localClipboardState = useHookstate(clipBoardState);
  const history = useHistory();
  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const deviceInfo = useDeviceInfo();

  const documentDtoColumns = useHookstate<GridColumn[]>([
    new GridColumn({
      field: 'key',
      headerName: 'Name',
      resizable: true,
      sortable: true,
      sort: 'asc',
      sortingOrder: ['asc', 'desc'],
      cellRenderer: DocSpaceItemRenderer,
      checkboxSelection: true,
      initialWidth: 400,
      cellRendererParams: {
        onClick: (doc: DocumentDto) => {
          const newPath = pageService.state.get().path + '/' + doc.key;
          const queryParams = new URLSearchParams(location.search);
          queryParams.set(spaceIdQueryKey, pageService.state.get().selectedSpace?.id ?? '');
          queryParams.set(pathQueryKey, newPath);
          history.push({ search: queryParams.toString() });
        },
        isFavorited: (document: DocumentDto) => {
          return pageService.getFavoritesShouldShow.bind(pageService, document, false)();
        },
      },
    }),
    new GridColumn({
      field: 'lastActivity',
      headerName: 'Last Uploaded',
      resizable: true,
      initialWidth: 250,
      valueFormatter: formatAgGridDateCell,
    }), 
    new GridColumn({
      field: 'lastModifiedDate',
      headerName: 'Last Modified',
      sortable: true,
      sortingOrder: ['asc', 'desc'],
      resizable: true,
      initialWidth: 250,
      valueGetter: function (params: ValueGetterParams) {
        if (params.data != null) {
          return new Date(params.data.lastModifiedDate); // return value as a JS Date that ag-grid likes for sorting
        }
      },
      valueFormatter: formatAgGridDateCell,
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
      headerName: 'Download',
      headerClass: 'header-center',
      resizable: true,
      cellRenderer: DocumentDownloadCellRenderer,
    }),
    new GridColumn({
      valueGetter: GridColumn.defaultValueGetter,
      headerName: 'More',
      headerClass: 'header-center',
      cellRenderer: DocumentRowActionCellRenderer,
      cellRendererParams: {
        menuItems: [
          {
            title: 'Add to favorites',
            icon: StarIcon,
            shouldShow: (doc: DocumentDto) => pageService.getFavoritesShouldShow.bind(pageService, doc, true)(),
            isAuthorized: () => true,
            onClick: pageService.addToFavorites.bind(pageService),
          },
          {
            title: 'Remove from favorites',
            icon: StarHollowIcon,
            iconProps: {
              size: 1.1,
            },
            shouldShow: (doc: DocumentDto) => pageService.getFavoritesShouldShow.bind(pageService, doc, false)(),
            isAuthorized: () => true,
            onClick: pageService.removeFromFavorites.bind(pageService),
          },
          {
            title: 'Remove',
            icon: CircleMinusIcon,
            isAuthorized: pageService.userIsAuthorizedForWriteInSpace.bind(pageService),
            onClick: (doc: DocumentDto) => pageService.mergeState({ selectedFile: doc, showDeleteDialog: true }),
          },
          {
            title: 'Rename Folder',
            icon: EditIcon,
            shouldShow: (doc: DocumentDto) => doc && doc.folder,
            isAuthorized: pageService.userIsAuthorizedForWriteInSpace.bind(pageService),
            onClick: (doc: DocumentDto) =>
              pageService.mergeState({
                selectedFile: doc,
                createEditElementOpType: CreateEditOperationType.EDIT_FOLDERNAME,
              }),
          },
          {
            title: 'Get Folder Size',
            icon: InfoIcon,
            shouldShow: (doc: DocumentDto) => doc && doc.folder,
            isAuthorized: () => true,
            onClick: (doc: DocumentDto) => {
              pageService.mergeState({ selectedItemForSize: doc, showFolderSizeDialog: true });
            },
          },
          {
            title: 'Rename File',
            icon: EditIcon,
            shouldShow: (doc: DocumentDto) => doc && !doc.folder,
            isAuthorized: pageService.userIsAuthorizedForWriteInSpace.bind(pageService),
            onClick: (doc: DocumentDto) =>
              pageService.mergeState({
                selectedFile: doc,
                createEditElementOpType: CreateEditOperationType.EDIT_FILENAME,
              }),
          },
          {
            title: 'Cut',
            icon: CutIcon,
            shouldShow: () => true,
            isAuthorized: pageService.userIsAuthorizedForWriteInSpace.bind(pageService),
            onClick: (doc: DocumentDto) => {
              localClipboardState.set({
                sourceSpace: doc.spaceId,
                isCopy: false,
                items: [joinPathParts(doc.path, doc.key)],
              });
              createTextToast(ToastType.SUCCESS, 'Items selected for CUT');
            },
          },
          {
            title: 'Copy',
            icon: CopyContentIcon,
            shouldShow: () => true,
            isAuthorized: pageService.userIsAuthorizedForWriteInSpace.bind(pageService),
            onClick: (doc: DocumentDto) => {
              localClipboardState.set({
                sourceSpace: doc.spaceId,
                isCopy: true,
                items: [joinPathParts(doc.path, doc.key)],
              });
              createTextToast(ToastType.SUCCESS, 'Items selected for COPY');
            },
          },
        ] as PopupMenuItem<DocumentDto>[],
      },
    }),
  ]);

  // Handle hiding columns on resize
  useEffect(() => {
    pageService.handleColumnsOnResize(documentDtoColumns, deviceInfo);
  }, [deviceInfo.isMobile, deviceInfo.deviceBySize]);

  return (
    <>
      {pageService.state.selectedSpace.value != null &&
        pageService.state.datasource.value &&
        documentSpacePrivilegesService.isAuthorizedForAction(
          pageService.state.selectedSpace.value.id,
          DocumentSpacePrivilegeDtoTypeEnum.Read
        ) && (
          <div className="breadcrumb-area">
            <BreadCrumbTrail
              path={pageService.state.get().path}
              onNavigate={(newPath) => {
                const queryParams = new URLSearchParams(location.search);
                queryParams.set(spaceIdQueryKey, pageService.state.get().selectedSpace?.id ?? '');
                if (newPath !== '') {
                  queryParams.set(pathQueryKey, newPath);
                } else {
                  queryParams.delete(pathQueryKey);
                }
                history.push({ search: queryParams.toString() });
              }}
            />
            <DocumentSpaceActions
              show={pageService.state.selectedSpace.value != null && !documentSpacePrivilegesService.isPromised}
              isMobile={deviceInfo.deviceBySize <= DeviceSize.TABLET || deviceInfo.isMobile}
              selectedSpace={pageService.state.selectedSpace}
              path={pageService.state.nested('path')}
              shouldUpdateDatasource={pageService.state.shouldUpdateDatasource}
              createEditElementOpType={pageService.state.createEditElementOpType}
              membershipsState={pageService.state.membershipsState}
              selectedFiles={pageService.state.selectedFiles}
              showDeleteSelectedDialog={pageService.state.showDeleteSelectedDialog}
              className="content-controls"
              documentPageService={pageService}
            />
          </div>
        )}
      {pageService.state.selectedSpace.value != null && pageService.state.datasource.ornull && (
        <FullPageInfiniteGrid
          columns={documentDtoColumns.attach(Downgraded).value}
          datasource={{ ...pageService.state.datasource.ornull.attach(Downgraded).value }}
          cacheBlockSize={generateInfiniteScrollLimit(pageService.infiniteScrollOptions)}
          maxBlocksInCache={pageService.infiniteScrollOptions.maxBlocksInCache}
          maxConcurrentDatasourceRequests={pageService.infiniteScrollOptions.maxConcurrentDatasourceRequests}
          suppressCellSelection
          updateDatasource={pageService.state.shouldUpdateDatasource.value}
          updateDatasourceCallback={pageService.onDatasourceUpdateCallback.bind(pageService)}
          getRowNodeId={pageService.getDocumentUniqueKey.bind(pageService)}
          onRowSelected={pageService.onDocumentRowSelected.bind(pageService)}
          rowSelection="multiple"
          suppressRowClickSelection
          autoResizeColumns
        />
      )}
    </>
  );
}

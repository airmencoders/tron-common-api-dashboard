import { Downgraded, State, useHookstate } from '@hookstate/core';
import { ValueFormatterParams } from 'ag-grid-community';
import { useEffect } from 'react';
import DocSpaceItemRenderer from '../../../components/DocSpaceItemRenderer/DocSpaceItemRenderer';
import DocumentRowActionCellRenderer, {
  PopupMenuItem
} from '../../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import FullPageInfiniteGrid from '../../../components/Grid/FullPageInifiniteGrid/FullPageInfiniteGrid';
import GridColumn from '../../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../../components/Grid/GridUtils/grid-utils';
import { useDeviceInfo } from '../../../hooks/PageResizeHook';
import CircleMinusIcon from '../../../icons/CircleMinusIcon';
import EditIcon from '../../../icons/EditIcon';
import StarHollowIcon from '../../../icons/StarHollowIcon';
import StarIcon from '../../../icons/StarIcon';
import { DocumentDto } from '../../../openapi';
import SpacesPageService from '../../../state/document-space/spaces-page/spaces-page-service';
import { CreateEditOperationType } from '../../../utils/document-space-utils';
import { formatPath } from '../../../utils/file-utils';
import DocumentDownloadCellRenderer from '../DocumentDownloadCellRenderer';
import { DocumentSpacePageTabEnum } from '../DocumentSpacePage';
import { formatAgGridDateCell } from './MyFilesAndFolders';

export interface RecentSpaceActivityProps {
  pageService: SpacesPageService;
  tabState?: State<DocumentSpacePageTabEnum>;
}

/**
 * This component basically just helps declutter an otherwise overly-bloated DocumentSpacePage
 * component... it specifically houses recent space uploads list
 */

export default function RecentSpaceActivity({ pageService }: RecentSpaceActivityProps) {
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
        isFavorited: (document: DocumentDto) => {
          return pageService.getFavoritesShouldShow.bind(pageService, document, false)();
        },
      },
    }),
    new GridColumn({
      field: 'path',
      headerName: 'Path',
      valueFormatter: function (params: ValueFormatterParams) {
        if (params.value) {
          return formatPath(params.value);
        }
      },
      resizable: true,
    }),
    new GridColumn({
      field: 'lastModifiedDate',  // the last modified date for RecentDocumentDto IS the lastActivityDate
      headerName: 'Last Uploaded',
      sortable: false,
      resizable: true,
      initialWidth: 250,
      valueFormatter: formatAgGridDateCell
    }),    
    new GridColumn({
      field: 'lastActivityBy',
      headerName: 'Last Uploaded By',
      resizable: true,
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
            onClick: (doc: DocumentDto) => pageService.mergeState({ 
              path: doc.path ?? '',
              selectedFile: doc, 
              showDeleteDialog: true 
            }),
          },
          {
            title: 'Rename File',
            icon: EditIcon,
            shouldShow: (doc: DocumentDto) => doc && !doc.folder,
            isAuthorized: pageService.userIsAuthorizedForWriteInSpace.bind(pageService),
            onClick: (doc: DocumentDto) =>
              pageService.mergeState({
                path: doc.path ?? '',
                selectedFile: doc,
                createEditElementOpType: CreateEditOperationType.EDIT_FILENAME,
              }),
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
      {pageService.state.selectedSpace.value != null && pageService.state.recentsDatasource.ornull && (
        <FullPageInfiniteGrid
          columns={documentDtoColumns.attach(Downgraded).value}
          datasource={{ ...pageService.state.recentsDatasource.ornull.attach(Downgraded).value }}
          cacheBlockSize={generateInfiniteScrollLimit(pageService.recentUploadsScrollOptions)}
          maxBlocksInCache={pageService.recentUploadsScrollOptions.maxBlocksInCache}
          maxConcurrentDatasourceRequests={pageService.recentUploadsScrollOptions.maxConcurrentDatasourceRequests}
          suppressCellSelection
          updateDatasource={pageService.state.shouldUpdateRecentsDatasource.value}
          updateDatasourceCallback={pageService.onRecentsDatasourceUpdateCallback.bind(pageService)}
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
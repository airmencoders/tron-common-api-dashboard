import { Downgraded, State, useHookstate } from '@hookstate/core';
import { ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { ChangeEvent, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '../../../components/Button/Button';
import DocSpaceItemRenderer from '../../../components/DocSpaceItemRenderer/DocSpaceItemRenderer';
import DocumentRowActionCellRenderer, {
  PopupMenuItem
} from '../../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import Form from '../../../components/forms/Form/Form';
import TextInput from '../../../components/forms/TextInput/TextInput';
import FullPageInfiniteGrid from '../../../components/Grid/FullPageInifiniteGrid/FullPageInfiniteGrid';
import GridColumn from '../../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../../components/Grid/GridUtils/grid-utils';
import { useDeviceInfo } from '../../../hooks/PageResizeHook';
import CircleMinusIcon from '../../../icons/CircleMinusIcon';
import EditIcon from '../../../icons/EditIcon';
import StarHollowIcon from '../../../icons/StarHollowIcon';
import StarIcon from '../../../icons/StarIcon';
import { DocumentDto, DocumentMobileDto } from '../../../openapi';
import SpacesPageService from '../../../state/document-space/spaces-page/spaces-page-service';
import { CreateEditOperationType } from '../../../utils/document-space-utils';
import { formatBytesToString, formatPath } from '../../../utils/file-utils';
import DocumentDownloadCellRenderer from '../DocumentDownloadCellRenderer';
import { DocumentSpacePageTabEnum } from '../DocumentSpacePage';
import { pathQueryKey, spaceIdQueryKey } from '../DocumentSpaceSelector';
import { formatAgGridDateCell } from './MyFilesAndFolders';

export interface SearchSpaceProps {
  pageService: SpacesPageService;
  tabState?: State<DocumentSpacePageTabEnum>;
}

/**
 * This component basically just helps declutter an otherwise overly-bloated DocumentSpacePage
 * component... it specifically houses search space functionality
 */

export default function SearchSpace({ pageService, tabState }: SearchSpaceProps) {
  const deviceInfo = useDeviceInfo();
  const history = useHistory();

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
        onClick: (doc: DocumentMobileDto) => {

          // clicking on a folder here - will take us back to the browse tab to that location
          const newPath = doc.path;
          const queryParams = new URLSearchParams(location.search);
          queryParams.set(spaceIdQueryKey, pageService.state.get().selectedSpace?.id ?? '');
          queryParams.set(pathQueryKey, newPath);
          history.push({ search: queryParams.toString() });

          // switch back to Browse mode
          tabState?.set(DocumentSpacePageTabEnum.BROWSE);
        },
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
            onClick: (doc: DocumentDto) => pageService.mergeState({
              path: doc.path ?? '',
              selectedFile: doc,
              showDeleteDialog: true 
            }),
          },
          {
            title: 'Rename Folder',
            icon: EditIcon,
            shouldShow: (doc: DocumentDto) => doc && doc.folder,
            isAuthorized: pageService.userIsAuthorizedForWriteInSpace.bind(pageService),
            onClick: (doc: DocumentDto) =>
              pageService.mergeState({
                path: doc.path ?? '',
                selectedFile: doc,
                createEditElementOpType: CreateEditOperationType.EDIT_FOLDERNAME,
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
      <div>
        <Form
          onSubmit={(event) => {
            pageService.submitSearchQuery();
            event.preventDefault();
          }}
        >
          <div style={{ display: 'flex' }}>
            <TextInput
              id="search-space-field"
              data-testid="search-space-field"
              name="search-space-field"
              value={pageService.state.searchQuery.value ?? ''}
              onChange={(event: ChangeEvent<HTMLInputElement>) => pageService.state.searchQuery.set(event.target.value)}
              type="search"
            />
            <Button
              className="docspace-search-button"
              type="button"
              onClick={() => pageService.submitSearchQuery()}
              disabled={!!!pageService.state.searchQuery.value || !!!pageService.state.searchQuery.value.trim()}
              data-testid="search-space-button"
            >
              Search
            </Button>
          </div>
        </Form>
      </div>
      <br />
      {pageService.state.selectedSpace.value != null && pageService.state.searchDatasource.ornull && (
        <FullPageInfiniteGrid
          columns={documentDtoColumns.attach(Downgraded).value}
          datasource={{ ...pageService.state.searchDatasource.ornull.attach(Downgraded).value }}
          cacheBlockSize={generateInfiniteScrollLimit(pageService.searchScrollOptions)}
          maxBlocksInCache={pageService.searchScrollOptions.maxBlocksInCache}
          maxConcurrentDatasourceRequests={pageService.searchScrollOptions.maxConcurrentDatasourceRequests}
          suppressCellSelection
          updateDatasource={pageService.state.shouldUpdateSearchDatasource.value}
          updateDatasourceCallback={pageService.onSearchDatasourceUpdateCallback.bind(pageService)}
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

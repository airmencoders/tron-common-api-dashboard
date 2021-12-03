import {SetPartialStateAction, State, useHookstate} from '@hookstate/core';
import {IDatasource, ValueFormatterParams} from 'ag-grid-community';
import React, {useEffect, useRef} from 'react';
import BreadCrumbTrail from '../../../components/BreadCrumbTrail/BreadCrumbTrail';
import {InfiniteScrollOptions} from '../../../components/DataCrudFormPage/infinite-scroll-options';
import DocumentRowActionCellRenderer
  from '../../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import GridColumn from '../../../components/Grid/GridColumn';
import {generateInfiniteScrollLimit} from '../../../components/Grid/GridUtils/grid-utils';
import PageFormat from '../../../components/PageFormat/PageFormat';
import {ToastType} from '../../../components/Toast/ToastUtils/toast-type';
import {createTextToast} from '../../../components/Toast/ToastUtils/ToastUtils';
import {
  DocumentDto,
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceResponseDto,
  DocumentSpaceUserCollectionResponseDto,
} from '../../../openapi';
import {useAuthorizedUserState} from '../../../state/authorized-user/authorized-user-state';
import {
  useDocumentSpaceGlobalState,
  documentSpaceDownloadUrlService,
  useDocumentSpacePrivilegesState,
  useDocumentSpaceState
} from '../../../state/document-space/document-space-state';
import {PrivilegeType} from '../../../state/privilege/privilege-type';
import '../DocumentSpacePage.scss';
import {format} from 'date-fns';
import {CancellableDataRequest} from '../../../utils/cancellable-data-request';
import Spinner from '../../../components/Spinner/Spinner';
import FavoritesCellRenderer from './FavoritesCellRenderer';
import CircleMinusIcon from '../../../icons/CircleMinusIcon';
import {useHistory} from "react-router";
import {useLocation} from "react-router-dom";
import StarHollowIcon from "../../../icons/StarHollowIcon";
import {prepareRequestError} from "../../../utils/ErrorHandling/error-handling-utils";
import DocumentSpaceSelector, {spaceIdQueryKey} from "../DocumentSpaceSelector";
import FullPageInfiniteGrid from "../../../components/Grid/FullPageInifiniteGrid/FullPageInfiniteGrid";
import DownloadMaterialIcon from "../../../icons/DownloadMaterialIcon";
import { performActionWhenMounted } from '../../../utils/component-utils';
import ArchiveDialog from '../../../components/documentspace/ArchiveDialog/ArchiveDialog';


const infiniteScrollOptions: InfiniteScrollOptions = {
  enabled: true,
  limit: 100,
};

interface DocumentSpaceFavoritesPageState {
  datasource?: IDatasource;
  shouldUpdateInfiniteCache: boolean;
  selectedFile?: DocumentSpaceUserCollectionResponseDto;
  showDeleteDialog: boolean;
  showRemoveDialog: boolean;
  selectedDocumentSpace?: DocumentSpaceResponseDto;
  shouldUpdateDatasource: boolean;
}

function getDocumentUniqueKey(data: DocumentSpaceUserCollectionResponseDto): string {
  return data.id;
}

function DocumentSpaceFavoritesPage() {
  const documentSpaceService = useDocumentSpaceState();
  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const authorizedUserService = useAuthorizedUserState();
  const globalDocumentSpaceService = useDocumentSpaceGlobalState();
  const downloadUrlService = documentSpaceDownloadUrlService();

  const history = useHistory();
  const location = useLocation();


  const pageState = useHookstate<DocumentSpaceFavoritesPageState>({
    datasource: undefined,
    shouldUpdateInfiniteCache: false,
    shouldUpdateDatasource: false,
    selectedFile: undefined,
    showDeleteDialog: false,
    showRemoveDialog: false,
    selectedDocumentSpace: undefined
  });

  useEffect(() => {
    loadDocSpaceFromLocation(location, documentSpaceService.documentSpaces);
  }, [location.search]);

  function loadDocSpaceFromLocation(locationService: any, documentSpaceList: Array<DocumentSpaceResponseDto>) {
    const queryParams = new URLSearchParams(locationService.search);
    if (queryParams.get(spaceIdQueryKey) != null && documentSpaceList.length > 0) {
      const selectedDocumentSpace = documentSpaceList.find(documentSpace => documentSpace.id === queryParams.get('spaceId'));
      if (selectedDocumentSpace == null) {
        createTextToast(ToastType.ERROR, 'Could not process the selected Document Space');
        return;
      }
      if (selectedDocumentSpace.id !== pageState.get().selectedDocumentSpace?.id) {
        setStateOnDocumentSpace(selectedDocumentSpace);
      }
    }
  }

  async function setStateOnDocumentSpace(documentSpace: DocumentSpaceResponseDto) {
    try {
      // Don't need to load privileges if current user is Dashboard Admin,
      // since they currently have access to everything Document Space related
      if (!isAdmin) {
        await documentSpacePrivilegesService.fetchAndStoreDashboardUserDocumentSpacePrivileges(documentSpace.id).promise;
      }

      performActionWhenMounted(mountedRef.current, () => {
        pageState.merge({
          selectedDocumentSpace: documentSpace,
          shouldUpdateDatasource: true,
          datasource: documentSpaceService.createFavoritesDocumentsDatasource(documentSpace.id, infiniteScrollOptions)
        });

        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get(spaceIdQueryKey) == null) {
          queryParams.set(spaceIdQueryKey, documentSpace.id);
          history.replace({ search: queryParams.toString() });
        }
      });
    }
    catch (err) {
      if (!mountedRef.current) {
        return;
      }

      const preparedError = prepareRequestError(err);
      if (preparedError.status === 403) {
        createTextToast(ToastType.ERROR, 'Not authorized for the selected Document Space');
      } else {
        createTextToast(ToastType.ERROR, 'Could not load privileges for the selected Document Space');
      }

      mergePageState({
        selectedDocumentSpace: undefined,
        datasource: undefined,
        shouldUpdateDatasource: false,
      });
    }
  }

  const isAdmin = authorizedUserService.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN);

  const isDocumentSpacesLoading =
    documentSpaceService.isDocumentSpacesStatePromised;
  const isDocumentSpacesErrored =
    documentSpaceService.isDocumentSpacesStateErrored;


  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    let spacesCancellableRequest: CancellableDataRequest<DocumentSpaceResponseDto[]>;

    async function loadDocumentSpaces() {
      spacesCancellableRequest = documentSpaceService.fetchAndStoreSpaces();

      let spaces: DocumentSpaceResponseDto[];
      try {
        spaces = await spacesCancellableRequest.promise;
      } catch (err) {
        performActionWhenMounted(mountedRef.current, () => {
          createTextToast(ToastType.ERROR, 'Could not load Document Spaces');
        });

        return;
      }

      // Check if navigating to an existing document space first
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get(spaceIdQueryKey) != null) {
        loadDocSpaceFromLocation(location, spaces);
        return;
      }

      const selectedSpace = globalDocumentSpaceService.getInitialSelectedDocumentSpace(spaces, authorizedUserService.authorizedUser?.defaultDocumentSpaceId);

      performActionWhenMounted(mountedRef.current, () => {
        if (selectedSpace != null) {
          setStateOnDocumentSpace(selectedSpace);
        } else {
          createTextToast(ToastType.ERROR, 'You do not have access to any Document Spaces');
        }
      });
    }

    loadDocumentSpaces();

    return function cleanup() {
      mountedRef.current = false;

      if (spacesCancellableRequest != null) {
        spacesCancellableRequest.cancelTokenSource.cancel();
      }

      documentSpaceService.resetState();
      documentSpacePrivilegesService.resetState();
    };
  }, []);

  async function deleteArchiveFile() {
    const file = pageState.selectedFile.value;

    if (file == null) {
      throw new Error('File cannot be null for File Archive Deletion');
    }

    try {
      await documentSpaceService.deleteArchiveItemBySpaceAndParent(file.documentSpaceId, file.parentId!, file.key);
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

  function mergePageState(partialState: Partial<DocumentSpaceFavoritesPageState>): void {
    mergeState<DocumentSpaceFavoritesPageState>(pageState, partialState);
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

  function shouldUpdateDatasourceCallback() {
    mergePageState({
      shouldUpdateDatasource: false
    });
  }

  async function getFolderPath ( folder: DocumentSpaceUserCollectionResponseDto ){
    const responsePath = await documentSpaceService.getDocumentSpaceEntryPath(folder.documentSpaceId, folder.itemId);
    if(responsePath === ''){
      createTextToast(ToastType.ERROR, 'Could not getFolderPath');
    }else{
      const queryParams = new URLSearchParams(location.search);
      queryParams.set('spaceId', pageState.get().selectedDocumentSpace?.id ?? '');
      queryParams.set('path', responsePath);
      if(mountedRef.current){
        history.push({pathname: '/document-space/spaces', search: queryParams.toString() });
      }
    }
  }

  function documentDtoColumns() {
    return [
      new GridColumn({
        field: 'key',
        headerName: 'Name',
        resizable: true,
        cellRenderer: FavoritesCellRenderer,
        cellRendererParams: {
          onClick: getFolderPath
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
        headerName: 'More',
        headerClass: 'header-center',
        cellRenderer: DocumentRowActionCellRenderer,
        cellRendererParams: {
          menuItems: [
            { title: 'Download',
              icon: DownloadMaterialIcon,
              iconProps: {
                style: 'primary',
                fill: true
              },
              shouldShow: (doc: DocumentSpaceUserCollectionResponseDto) => doc != null,
              onClick: async (data: DocumentSpaceUserCollectionResponseDto) => {
                const responsePath  = await documentSpaceService.getDocumentSpaceEntryPath(data.documentSpaceId, data.parentId!)

                  if(data.folder){
                    const doc: DocumentDto = {
                      lastModifiedBy: "", lastModifiedDate: "",
                      path: responsePath,
                      size: 0,
                      spaceId: data.documentSpaceId,
                      key:data.key
                    }
                    window.location.href = downloadUrlService.createRelativeFilesDownloadUrl(data.documentSpaceId, responsePath, [doc])
                  }else{
                    window.location.href = downloadUrlService.createRelativeDownloadFileUrl(data.documentSpaceId, responsePath, data.key, true)
                  }

              },
              isAuthorized: () => true
            },
            { title: 'Remove from favorites',
              icon: StarHollowIcon,
              onClick: (data: DocumentSpaceUserCollectionResponseDto) => {
                documentSpaceService.removeEntityFromFavorites(data.documentSpaceId, data.id)
                  .then((response)=>{
                    pageState.shouldUpdateDatasource.set(true)
                  })
              },
              isAuthorized: () => true
            },
            {
              title: 'Remove',
              icon: CircleMinusIcon,
              onClick: (data: DocumentSpaceUserCollectionResponseDto) => {
                mergePageState({ selectedFile: data, showDeleteDialog: true })
              },
              isAuthorized: (data: DocumentSpaceUserCollectionResponseDto) => {
                return data && documentSpacePrivilegesService.isAuthorizedForAction(data.documentSpaceId, DocumentSpacePrivilegeDtoTypeEnum.Write);
              }
            },
          ],
        }
      })
    ];
  }

  return (
    <PageFormat pageTitle="Favorite files and folders">
      {documentSpaceService.isDocumentSpacesStatePromised ?
        <Spinner /> :
        <>
          <>
            <DocumentSpaceSelector isDocumentSpacesLoading={isDocumentSpacesLoading} isDocumentSpacesErrored={isDocumentSpacesErrored} documentSpaceService={documentSpaceService} selectedSpace={pageState.selectedDocumentSpace?.value}/>
          </>
          <div className="breadcrumb-area">
            <BreadCrumbTrail
              path=""
              onNavigate={() => { return }}
              rootName="Favorites"
            />
          </div>
          {pageState.datasource.value &&
            <FullPageInfiniteGrid
              columns={documentDtoColumns()}
              datasource={pageState.datasource.value}
              cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
              maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
              maxConcurrentDatasourceRequests={infiniteScrollOptions.maxConcurrentDatasourceRequests}
              suppressCellSelection
              suppressRowClickSelection
              getRowNodeId={getDocumentUniqueKey}
              updateInfiniteCache={pageState.shouldUpdateInfiniteCache.value}
              updateInfiniteCacheCallback={shouldUpdateInfiniteCacheCallback}
              updateDatasource={pageState.shouldUpdateDatasource.value}
              updateDatasourceCallback={shouldUpdateDatasourceCallback}
            />
          }

          <ArchiveDialog
            show={pageState.showDeleteDialog.get()}
            onCancel={() => pageState.showDeleteDialog.set(false)}
            onSubmit={deleteArchiveFile}
            items={pageState.selectedFile.value}
          />
        </>
      }
    </PageFormat>
  );
}

export default DocumentSpaceFavoritesPage;

import {SetPartialStateAction, State, useHookstate} from '@hookstate/core';
import {IDatasource, ValueFormatterParams} from 'ag-grid-community';
import React, {useEffect, useRef} from 'react';
import BreadCrumbTrail from '../../../components/BreadCrumbTrail/BreadCrumbTrail';
import {InfiniteScrollOptions} from '../../../components/DataCrudFormPage/infinite-scroll-options';
import DocumentRowActionCellRenderer
  from '../../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import GridColumn from '../../../components/Grid/GridColumn';
import {generateInfiniteScrollLimit} from '../../../components/Grid/GridUtils/grid-utils';
import InfiniteScrollGrid from '../../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import PageFormat from '../../../components/PageFormat/PageFormat';
import {ToastType} from '../../../components/Toast/ToastUtils/toast-type';
import {createTextToast} from '../../../components/Toast/ToastUtils/ToastUtils';
import {
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceResponseDto,
  DocumentSpaceUserCollectionResponseDto,
} from '../../../openapi';
import {useAuthorizedUserState} from '../../../state/authorized-user/authorized-user-state';
import {
  useDocumentSpacePrivilegesState,
  useDocumentSpaceState
} from '../../../state/document-space/document-space-state';
import {PrivilegeType} from '../../../state/privilege/privilege-type';
import '../DocumentSpacePage.scss';
import {format} from 'date-fns';
import {CancellableDataRequest} from '../../../utils/cancellable-data-request';
import DeleteDocumentDialog from '../DocumentDelete';
import Spinner from '../../../components/Spinner/Spinner';
import FavoritesCellRenderer from './FavoritesCellRenderer';
import CircleMinusIcon from '../../../icons/CircleMinusIcon';
import {useHistory} from "react-router";
import {useLocation} from "react-router-dom";
import StarHollowIcon from "../../../icons/StarHollowIcon";
import {prepareRequestError} from "../../../utils/ErrorHandling/error-handling-utils";
import DocumentSpaceSelector, {spaceIdQueryKey} from "../DocumentSpaceSelector";


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
  selectedDocumentSpaceId?: string;
  shouldUpdateDatasource: boolean;
}

function getDocumentUniqueKey(data: DocumentSpaceUserCollectionResponseDto): string {
  return data.id;
}

function DocumentSpaceFavoritesPage() {
  const documentSpaceService = useDocumentSpaceState();
  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const authorizedUserService = useAuthorizedUserState();
  const history = useHistory();
  const location = useLocation();


  const pageState = useHookstate<DocumentSpaceFavoritesPageState>({
    datasource: undefined,
    shouldUpdateInfiniteCache: false,
    shouldUpdateDatasource: false,
    selectedFile: undefined,
    showDeleteDialog: false,
    showRemoveDialog: false,
    selectedDocumentSpaceId: undefined
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
      if (selectedDocumentSpace.id !== pageState.get().selectedDocumentSpaceId) {
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

      mergePageState({
        selectedDocumentSpaceId: documentSpace.id,
        shouldUpdateDatasource: true,
        datasource: documentSpaceService.createFavoritesDocumentsDatasource(documentSpace.id, infiniteScrollOptions),

      });
    }
    catch (err) {
      const preparedError = prepareRequestError(err);
      if (!mountedRef.current) {
        return;
      }
      if (preparedError.status === 403) {
        createTextToast(ToastType.ERROR, 'Not authorized for the selected Document Space');
      } else {
        createTextToast(ToastType.ERROR, 'Could not load privileges for the selected Document Space');
      }

      mergePageState({
        selectedDocumentSpaceId: undefined,
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

        const defaultDocumentSpaceId = authorizedUserService.authorizedUser?.defaultDocumentSpaceId;


        if(!!defaultDocumentSpaceId){
          mergePageState({
            selectedDocumentSpaceId: defaultDocumentSpaceId,
            datasource: documentSpaceService.createFavoritesDocumentsDatasource(defaultDocumentSpaceId, infiniteScrollOptions),
            shouldUpdateDatasource: true,
          });
        } else if (spaces.length > 0) {
          const initialSpaceId = spaces[0].id;
          mergePageState({
            selectedDocumentSpaceId: initialSpaceId,
            datasource: documentSpaceService.createFavoritesDocumentsDatasource(initialSpaceId, infiniteScrollOptions),
            shouldUpdateDatasource: true,
          });
        }
      } catch (err) {
        if (mountedRef.current) {
          createTextToast(ToastType.ERROR, 'Could not load Document Spaces');
        }
      }
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

  useEffect(() => {
    let privilegesCancellableRequest: CancellableDataRequest<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>;

    async function loadPrivileges() {
      // Load privileges for the selected document space
      if (!isAdmin && pageState.selectedDocumentSpaceId.value) {
        privilegesCancellableRequest = documentSpacePrivilegesService.fetchAndStoreDashboardUserDocumentSpacePrivileges(pageState.selectedDocumentSpaceId.value);

        try {
          await privilegesCancellableRequest.promise;

        } catch (err) {
          if (mountedRef.current) {
            createTextToast(ToastType.WARNING, 'Could not load Document Space privileges. Actions will be limited');
          }
        }
      }
    }

    loadPrivileges();

    return function cleanup() {
      if (privilegesCancellableRequest != null) {
        privilegesCancellableRequest.cancelTokenSource.cancel();
      }
    };
  }, [pageState.selectedDocumentSpaceId.value]);

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
      queryParams.set('spaceId', pageState.get().selectedDocumentSpaceId ?? '');
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
        checkboxSelection: true,
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
            <DocumentSpaceSelector isDocumentSpacesLoading={isDocumentSpacesLoading} isDocumentSpacesErrored={isDocumentSpacesErrored} documentSpaceService={documentSpaceService} selectedSpaceId={pageState.selectedDocumentSpaceId?.value}/>
          </>
          <div className="breadcrumb-area">
            <BreadCrumbTrail
              path=""
              onNavigate={() => { return }}
              rootName="Favorites"
            />
          </div>
          {pageState.datasource.value &&
            <InfiniteScrollGrid
              columns={documentDtoColumns()}
              datasource={pageState.datasource.value}
              cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
              maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
              maxConcurrentDatasourceRequests={infiniteScrollOptions.maxConcurrentDatasourceRequests}
              suppressCellSelection
              getRowNodeId={getDocumentUniqueKey}
              rowSelection="single"
              updateInfiniteCache={pageState.shouldUpdateInfiniteCache.value}
              updateInfiniteCacheCallback={shouldUpdateInfiniteCacheCallback}
              updateDatasource={pageState.shouldUpdateDatasource.value}
              updateDatasourceCallback={shouldUpdateDatasourceCallback}
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

export default DocumentSpaceFavoritesPage;

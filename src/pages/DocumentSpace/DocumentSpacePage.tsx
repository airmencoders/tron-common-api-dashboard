import {Downgraded, none, SetPartialStateAction, State, useHookstate} from '@hookstate/core';
import {IDatasource, ValueFormatterParams} from 'ag-grid-community';
import React, {useEffect, useRef} from 'react';
import {useHistory} from 'react-router';
import {useLocation} from 'react-router-dom';
import BreadCrumbTrail from '../../components/BreadCrumbTrail/BreadCrumbTrail';
import Button from '../../components/Button/Button';
import {InfiniteScrollOptions} from '../../components/DataCrudFormPage/infinite-scroll-options';
import DocSpaceItemRenderer from '../../components/DocSpaceItemRenderer/DocSpaceItemRenderer';
import DocumentRowActionCellRenderer, {PopupMenuItem} from '../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import FormGroup from '../../components/forms/FormGroup/FormGroup';
import {GridSelectionType} from '../../components/Grid/grid-selection-type';
import GridColumn from '../../components/Grid/GridColumn';
import {generateInfiniteScrollLimit} from '../../components/Grid/GridUtils/grid-utils';
import PageFormat from '../../components/PageFormat/PageFormat';
import {SideDrawerSize} from '../../components/SideDrawer/side-drawer-size';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import {ToastType} from '../../components/Toast/ToastUtils/toast-type';
import {createTextToast} from '../../components/Toast/ToastUtils/ToastUtils';
import AddMaterialIcon from '../../icons/AddMaterialIcon';
import {
  DocumentDto, DocumentSpacePathItemsDto,
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceRequestDto,
  DocumentSpaceResponseDto
} from '../../openapi';
import {useAuthorizedUserState} from '../../state/authorized-user/authorized-user-state';
import {FormActionType} from '../../state/crud-page/form-action-type';
import {documentSpaceDownloadUrlService, useDocumentSpaceGlobalState, useDocumentSpacePrivilegesState, useDocumentSpaceState} from '../../state/document-space/document-space-state';
import {PrivilegeType} from '../../state/privilege/privilege-type';
import {prepareRequestError} from '../../utils/ErrorHandling/error-handling-utils';
import {formatBytesToString} from '../../utils/file-utils';
import DocumentDownloadCellRenderer from './DocumentDownloadCellRenderer';
import DocumentSpaceCreateEditForm from './DocumentSpaceCreateEditForm';
import DocumentSpaceEditForm from './DocumentSpaceEditForm';
import DocumentSpaceMemberships from './Memberships/DocumentSpaceMemberships';
import DocumentSpaceMySettingsForm from "./DocumentSpaceMySettingsForm";
import './DocumentSpacePage.scss';
import {formatDocumentSpaceDate} from '../../utils/date-utils';
import UserIcon from "../../icons/UserIcon";
import UserIconCircle from "../../icons/UserIconCircle";
import CircleMinusIcon from '../../icons/CircleMinusIcon';
import EditIcon from '../../icons/EditIcon';
import StarIcon from '../../icons/StarIcon';
import UploadIcon from '../../icons/UploadIcon';
import DocumentSpaceSelector, {pathQueryKey, spaceIdQueryKey} from "./DocumentSpaceSelector";
import {DocumentSpaceUserCollectionResponseDto} from '../../openapi/models/document-space-user-collection-response-dto';
import {DeviceSize, useDeviceInfo} from '../../hooks/PageResizeHook';
import DownloadMaterialIcon from '../../icons/DownloadMaterialIcon';
import DocumentSpaceActions from '../../components/documentspace/Actions/DocumentSpaceActions';
import { CreateEditOperationType, getCreateEditTitle } from '../../state/document-space/document-space-utils';
import StarHollowIcon from '../../icons/StarHollowIcon';
import ArchiveDialog from '../../components/documentspace/ArchiveDialog/ArchiveDialog';
import FullPageInfiniteGrid from "../../components/Grid/FullPageInifiniteGrid/FullPageInfiniteGrid";
import { performActionWhenMounted } from '../../utils/component-utils';

const infiniteScrollOptions: InfiniteScrollOptions = {
  enabled: true,
  limit: 100,
};

interface DocumentSpacePageState {
  drawerOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  showErrorMessage: boolean;
  selectedSpace?: DocumentSpaceResponseDto;
  shouldUpdateInfiniteCache: boolean;
  shouldUpdateDatasource: boolean;
  datasource?: IDatasource;
  showUploadDialog: boolean;
  showDeleteDialog: boolean;
  fileToDelete: string;
  selectedFiles: DocumentDto[];
  membershipsState: {
    isOpen: boolean;
  },
  createEditElementOpType: CreateEditOperationType;
  clickedItemName?: string;
  path: string;
  showDeleteSelectedDialog: boolean;
  isDefaultDocumentSpaceSettingsOpen: boolean;
  sideDrawerSize: SideDrawerSize;
  favorites: DocumentSpaceUserCollectionResponseDto[];
}

function getDocumentUniqueKey(data: DocumentDto): string {
  return data.path + '__' + data.key;
}

function DocumentSpacePage() {
  const pageState = useHookstate<DocumentSpacePageState>({
    drawerOpen: false,
    isSubmitting: false,
    showErrorMessage: false,
    errorMessage: '',
    selectedSpace: undefined,
    shouldUpdateInfiniteCache: false,
    shouldUpdateDatasource: false,
    datasource: undefined,
    showUploadDialog: false,
    showDeleteDialog: false,
    fileToDelete: '',
    selectedFiles: [],
    membershipsState: {
      isOpen: false
    },
    createEditElementOpType: CreateEditOperationType.NONE,
    path: '',
    showDeleteSelectedDialog: false,
    isDefaultDocumentSpaceSettingsOpen: false,
    sideDrawerSize: SideDrawerSize.WIDE,
    favorites: []
  });

  const location = useLocation();
  const history = useHistory();

  const documentSpaceService = useDocumentSpaceState();
  const documentSpacePrivilegesService = useDocumentSpacePrivilegesState();
  const downloadUrlService = documentSpaceDownloadUrlService();
  const globalDocumentSpaceService = useDocumentSpaceGlobalState();
  const authorizedUserService = useAuthorizedUserState();

  const isAdmin = authorizedUserService.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN);

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
        onClick: (folder: string) => {
          const newPath = pageState.get().path + '/' + folder;
          const queryParams = new URLSearchParams(location.search);
          queryParams.set(spaceIdQueryKey, pageState.get().selectedSpace?.id ?? '');
          queryParams.set(pathQueryKey, newPath);
          history.push({ search: queryParams.toString() });
        },
        isFavorited: (document: DocumentDto)=>{
          return getFavoritesShouldShow(document, false)
        }
      }
    }),
    new GridColumn({
      field: 'lastModifiedDate',
      headerName: 'Last Modified',
      sortable: true,
      sortingOrder: ['asc', 'desc'],
      resizable: true,
      initialWidth: 250,
      valueFormatter: function (params: ValueFormatterParams) {
        if (params.value) {
          return formatDocumentSpaceDate(params.value);
        }
      }
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
      }
    }),
    new GridColumn({
      valueGetter: GridColumn.defaultValueGetter,
      headerName: 'Download',
      headerClass: 'header-center',
      resizable: true,
      cellRenderer: DocumentDownloadCellRenderer
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
            shouldShow: (doc: DocumentDto) => getFavoritesShouldShow(doc, true),
            isAuthorized: () => true,
            onClick: addToFavorites,
            
          },
          {
            title: 'Remove from favorites',
            icon: StarHollowIcon,
            iconProps: {
              size: 1.1
            },
            shouldShow: (doc: DocumentDto) => getFavoritesShouldShow(doc, false),
            isAuthorized: () => true,
            onClick: removeFromFavorites,
          },
          {
            title: 'Remove',
            icon: CircleMinusIcon,
            isAuthorized: (doc: DocumentDto) => doc != null && documentSpacePrivilegesService.isAuthorizedForAction(doc.spaceId, DocumentSpacePrivilegeDtoTypeEnum.Write),
            onClick: (doc: DocumentDto) => mergeState(pageState, { selectedFiles: [doc], showDeleteDialog: true }),
          },
          { 
            title: 'Rename Folder', 
            icon: EditIcon, 
            shouldShow: (doc: DocumentDto) => doc && doc.folder,
            isAuthorized: (doc: DocumentDto) => doc != null && documentSpacePrivilegesService.isAuthorizedForAction(doc.spaceId, DocumentSpacePrivilegeDtoTypeEnum.Write),
            onClick: (doc: DocumentDto) => mergeState(pageState, { 
              clickedItemName: doc.key, 
              createEditElementOpType: CreateEditOperationType.EDIT_FOLDERNAME, 
            })
          },
          { 
            title: 'Rename File', 
            icon: EditIcon, 
            shouldShow: (doc: DocumentDto) => doc && !doc.folder,
            isAuthorized: (doc: DocumentDto) => doc != null && documentSpacePrivilegesService.isAuthorizedForAction(doc.spaceId, DocumentSpacePrivilegeDtoTypeEnum.Write),
            onClick: (doc: DocumentDto) => mergeState(pageState, { 
              clickedItemName: doc.key, 
              createEditElementOpType: CreateEditOperationType.EDIT_FILENAME, 
            })
          },
        ] as PopupMenuItem<DocumentDto>[],
      },
    })
  ]);

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const spacesCancellableRequest = documentSpaceService.fetchAndStoreSpaces();

    async function setInitialSpaceOnLoad() {
      let data: DocumentSpaceResponseDto[];
      try {
        data = await spacesCancellableRequest.promise;
      } catch (err) {
        createTextToast(ToastType.ERROR, 'Could not load Document Spaces');
        return;
      }

      // Check if navigating to an existing document space first
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get(spaceIdQueryKey) != null) {
        loadDocSpaceFromLocation(location, data);
        return;
      }

      const selectedSpace = globalDocumentSpaceService.getInitialSelectedDocumentSpace(data, authorizedUserService.authorizedUser?.defaultDocumentSpaceId);
      
      performActionWhenMounted(mountedRef.current, () => {
        if (selectedSpace != null) {
          setStateOnDocumentSpaceAndPathChange(selectedSpace, '');
        } else {
          createTextToast(ToastType.ERROR, 'You do not have access to any Document Spaces');
        }
      });
    }

    setInitialSpaceOnLoad();

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
    loadDocSpaceFromLocation(location, documentSpaceService.documentSpaces);
  }, [location.search]);

  function conditionalMenuDownloadOnClick (doc: DocumentDto) {
    if(doc.folder && !doc.hasContents){
      createTextToast(ToastType.WARNING, 'Unable to download a folder with no contents')
    }else{
      window.location.href = downloadUrlService.createRelativeFilesDownloadUrl(doc.spaceId, doc.path, [doc])
    }
  }
  // Handle hiding columns on resize
  useEffect(() => {
    const hideableColumns = documentDtoColumns.filter(column => column.field.value !== 'key' && column.field.value !== 'lastModifiedDate' && column.headerName.value !== 'More');
    if (deviceInfo.isMobile || deviceInfo.deviceBySize <= DeviceSize.TABLET) {
      hideableColumns.forEach(column => {
        if (!column.hide.value) {
          column.hide.set(true)
        }
      });

      // Get the "More" actions column
      const moreActionsColumn = documentDtoColumns.find(column => column.headerName.value === 'More');
      
      // Check if "Download" action already exists
      const cellRendererParams = (moreActionsColumn?.cellRendererParams as State<{ menuItems: PopupMenuItem<DocumentDto>[] }>);
      const downloadAction = cellRendererParams.menuItems.find(menuItem => menuItem.title.value === 'Download');

      if (downloadAction == null) {
        cellRendererParams.set(state => {
          state.menuItems.splice(0, 0, { 
            title: 'Download', 
            icon: DownloadMaterialIcon,
            iconProps: {
              style: 'primary',
              fill: true
            },
            shouldShow: (doc: DocumentDto) => doc != null,
            isAuthorized: () => true,
            onClick: conditionalMenuDownloadOnClick
          });
  
          return state;
        });
      }
    } else {
      hideableColumns.forEach(column => {
        if (column.hide.value) {
          column.hide.set(false)
        }
      });

      // Remove Download from "More" actions cell renderer
      const moreActionsColumn = documentDtoColumns.find(column => column.headerName.value === 'More');
      (moreActionsColumn?.cellRendererParams as State<{ menuItems: PopupMenuItem<DocumentDto>[] }>).menuItems.find(menuItem => menuItem.title.value === 'Download')?.set(none);
    }
  }, [deviceInfo.isMobile, deviceInfo.deviceBySize]);

  function loadDocSpaceFromLocation(locationService: any, documentSpaceList: Array<DocumentSpaceResponseDto>) {
    const queryParams = new URLSearchParams(locationService.search);
    if (queryParams.get(spaceIdQueryKey) != null && documentSpaceList.length > 0) {
      const selectedDocumentSpace = documentSpaceList.find(documentSpace => documentSpace.id === queryParams.get('spaceId'));
      if (selectedDocumentSpace == null) {
        createTextToast(ToastType.ERROR, 'Could not process the selected Document Space');
        return;
      }
      const path = queryParams.get(pathQueryKey) ?? '';
      if (selectedDocumentSpace.id !== pageState.get().selectedSpace?.id ||
        path !== pageState.get().path) {
        setStateOnDocumentSpaceAndPathChange(selectedDocumentSpace, path);
      }
    }
  }

  function mergePageState(partialState: Partial<DocumentSpacePageState>): void {
    if (mountedRef.current) {
      mergeState<DocumentSpacePageState>(pageState, partialState);
    }
  }

  function mergeState<T>(state: State<T>, partialState: SetPartialStateAction<T>): void {
    if (mountedRef.current) {
      state.merge(partialState);
    }
  }

  async function setStateOnDocumentSpaceAndPathChange(documentSpace: DocumentSpaceResponseDto, path: string) {
    try {
      // Don't need to load privileges if current user is Dashboard Admin,
      // since they currently have access to everything Document Space related
      if (!isAdmin) {
        await documentSpacePrivilegesService.fetchAndStoreDashboardUserDocumentSpacePrivileges(documentSpace.id).promise;
      }
      const favorites: DocumentSpaceUserCollectionResponseDto[] = (await documentSpaceService.getFavorites(documentSpace.id)).data.data;

      mergePageState({
        selectedSpace: documentSpace,
        shouldUpdateDatasource: true,
        datasource: documentSpaceService.createDatasource(
          documentSpace.id,
          path,
          infiniteScrollOptions
        ),
        path,
        selectedFiles: [],
        favorites
      });

      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get(spaceIdQueryKey) == null) {
        queryParams.set(spaceIdQueryKey, documentSpace.id);
        history.replace({ search: queryParams.toString() });
      }
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
        selectedSpace: undefined,
        datasource: undefined,
        shouldUpdateDatasource: false,
        selectedFiles: [],
      });
    }
  }

  function onDatasourceUpdateCallback() {
    mergePageState({
      shouldUpdateDatasource: false,
      selectedFiles: []
    });
  }

  function onInfiniteCacheUpdateCallback() {
    mergePageState({
      shouldUpdateInfiniteCache: false
    });
  }

  function setPageStateOnException(message: string) {
    mergePageState({
      isSubmitting: false,
      errorMessage: message,
      showErrorMessage: true,
    })
  }

  function submitElementName(name: string) {
    pageState.merge({ isSubmitting: true });
    if (pageState.selectedSpace.value?.id === undefined) return;

    switch (pageState.createEditElementOpType.get()) {
      case CreateEditOperationType.EDIT_FOLDERNAME:
        documentSpaceService.renameFolder(pageState.selectedSpace.value?.id,
          pageState.get().path + "/" + pageState.clickedItemName.get(), 
          name)
          .then(() => {
            mergePageState({
              createEditElementOpType: CreateEditOperationType.NONE,
              isSubmitting: false,
              showErrorMessage: false,
              shouldUpdateInfiniteCache: true,
              clickedItemName: undefined,
            });
            createTextToast(ToastType.SUCCESS, "Folder renamed");
          })
          .catch(message => setPageStateOnException(message));
        break;
      case CreateEditOperationType.CREATE_FOLDER:
        documentSpaceService.createNewFolder(pageState.selectedSpace.value?.id,
          pageState.get().path, name)
          .then(() => {
            mergePageState({
              createEditElementOpType: CreateEditOperationType.NONE,
              isSubmitting: false,
              showErrorMessage: false,
              shouldUpdateInfiniteCache: true,
            });
            createTextToast(ToastType.SUCCESS, "Folder created");
          })
          .catch(message => setPageStateOnException(message));
        break;
      case CreateEditOperationType.EDIT_FILENAME:
        documentSpaceService.renameFile(pageState.selectedSpace.value?.id,
          pageState.get().path, 
          pageState.clickedItemName.get() ?? '',  // blank if undefined, will allow to fail out..
          name)
          .then(() => {
            mergePageState({
              createEditElementOpType: CreateEditOperationType.NONE,
              isSubmitting: false,
              showErrorMessage: false,
              shouldUpdateInfiniteCache: true,
              clickedItemName: undefined,
            });
            createTextToast(ToastType.SUCCESS, "File renamed");
          })
          .catch(message => setPageStateOnException(message));
        break;
      default:
        break;
    }
  }

  async function submitDocumentSpace(space: DocumentSpaceRequestDto) {
    pageState.merge({ isSubmitting: true });

    try {
      const createdSpace = await documentSpaceService.createDocumentSpace(space);
      mergePageState({
        drawerOpen: false,
        isSubmitting: false,
        showErrorMessage: false
      });

      const queryParams = new URLSearchParams(location.search);
      queryParams.set(spaceIdQueryKey, createdSpace.id);
      queryParams.delete(pathQueryKey);
      history.push({ search: queryParams.toString() });
    } catch (error) {
      setPageStateOnException(error as string);
    }
  }

  function closeDrawer(): void {
    pageState.merge({ drawerOpen: false });
  }

  function closeMySettingsDrawer(): void {
    pageState.merge({ isDefaultDocumentSpaceSettingsOpen: false });
  }

  function submitDefaultDocumentSpace(spaceId: string) {
    pageState.merge({ isSubmitting: true });
    documentSpaceService
      .patchDefaultDocumentSpace(spaceId)
      .then((docSpaceId) => {

        authorizedUserService.setDocumentSpaceDefaultId(docSpaceId);
        mergePageState({
          isDefaultDocumentSpaceSettingsOpen: false,
          isSubmitting: false,
          showErrorMessage: false,
          path: '',
        });
      })
      .catch((message) => setPageStateOnException(message));
  }

  function closeErrorMsg(): void {
    pageState.merge({ showErrorMessage: false });
  }

  function closeRemoveDialog(): void {
    pageState.merge({ showDeleteDialog: false, showDeleteSelectedDialog: false });
  }

  async function archiveFile(): Promise<void> {
    const selectedSpace = pageState.selectedSpace.value;

    if (selectedSpace == null) {
      return;
    }

    try {
      await documentSpaceService.archiveItems(
        selectedSpace.id,
        pageState.get().path,
        pageState.get().selectedFiles.map(item => item.key)
      );
      createTextToast(ToastType.SUCCESS, 'Item(s) Archived');
    }
    catch (e) {
      createTextToast(ToastType.ERROR, 'Could not archive item(s) - ' + (e as Error).message);
    }

    pageState.merge({
      selectedFiles: [],
      shouldUpdateInfiniteCache: true
    });
    closeRemoveDialog();
  }

  async function addToFavorites(doc: DocumentDto) {
    if(pageState.selectedSpace?.value !== undefined){
      const reqDto: DocumentSpacePathItemsDto = { currentPath: doc.path, items: [doc.key]}
      await documentSpaceService.addPathEntityToFavorites(
        pageState.selectedSpace.value.id,
        reqDto
      );

      const placeHolderResponse: DocumentSpaceUserCollectionResponseDto = {
        metadata: {},
        id: '',
        itemId: '',
        documentSpaceId: doc.spaceId,
        key: doc.key,
        lastModifiedDate: '',
        folder: doc.folder
      }
      if(mountedRef.current) {
        pageState.favorites.merge([placeHolderResponse])

        pageState.shouldUpdateInfiniteCache.set(true)
      }
      createTextToast(ToastType.SUCCESS, 'Successfully added to favorites');
    }else{
      createTextToast(ToastType.ERROR, 'Could not add to favorites');
    }

  }
  async function removeFromFavorites(doc: DocumentDto) {
    if(pageState.selectedSpace?.value !== undefined){
      const reqDto: DocumentSpacePathItemsDto = { currentPath: doc.path, items: [doc.key]}
      await documentSpaceService.removePathEntityFromFavorites(
        pageState.selectedSpace.value.id,
        reqDto
      );
      if(pageState.favorites.value.length){
        if(mountedRef.current) {
          pageState.favorites.set(favorites => {
            return favorites.filter(f => f.key !== doc.key);
          })

          pageState.shouldUpdateInfiniteCache.set(true)
        }
        createTextToast(ToastType.SUCCESS, 'Successfully removed from favorites');
      }
    }else{
      createTextToast(ToastType.ERROR, 'Could not remove from favorites');
    }
  }

  function onDocumentRowSelected(data: DocumentDto, selectionEvent: GridSelectionType) {
    const selectedFiles = pageState.selectedFiles;
    if (selectionEvent === 'selected') {
      selectedFiles[selectedFiles.length].set(data);
    } else {
      selectedFiles.find(document => document.key.value === data.key)?.set(none);
    }
  }

  const isDocumentSpacesLoading =
    documentSpaceService.isDocumentSpacesStatePromised;
  const isDocumentSpacesErrored =
    documentSpaceService.isDocumentSpacesStateErrored;

  function getFavoritesShouldShow (doc: DocumentDto, addingToFavorites: boolean) {
     const foundInFavorites = pageState.favorites?.value?.filter(favorite => {
      if (doc === undefined) {
        return false
      } else {
        return favorite.key === doc.key
      }
    }).length

    return addingToFavorites ? !foundInFavorites : foundInFavorites
  }

  return (
    <PageFormat pageTitle="Document Space" className="document-space-page">
      <FormGroup labelName="document-space" labelText="Spaces" isError={false} className="document-space-page__space-select">
        <div className="add-space-container">
          <div>
            <DocumentSpaceSelector isDocumentSpacesLoading={isDocumentSpacesLoading} isDocumentSpacesErrored={isDocumentSpacesErrored} documentSpaceService={documentSpaceService} selectedSpace={pageState.selectedSpace?.value}/>
            {isAdmin && !documentSpacePrivilegesService.isPromised && (
              <Button
                data-testid="add-doc-space__btn"
                type="button"
                onClick={() => pageState.merge({ drawerOpen: true })}
                disabled={isDocumentSpacesLoading || isDocumentSpacesErrored}
              >
                Add New Space <AddMaterialIcon fill size={1} />
              </Button>
            )}

            {documentSpaceService.documentSpaces.length && (
              <Button
                  className="document-space-page__space-user-settings"
                  data-testid="doc-space-my-settings__btn"
                  type="button"
                  unstyled
                  disableMobileFullWidth
                  onClick={() => pageState.isDefaultDocumentSpaceSettingsOpen.set(true)}
              >
                <UserIcon size={0} />
              </Button>
            )}
          </div>
        </div>
      </FormGroup>
      <div className="breadcrumb-area">
        <BreadCrumbTrail
          path={pageState.get().path}
          onNavigate={(newPath) => {
            const queryParams = new URLSearchParams(location.search);
            queryParams.set(spaceIdQueryKey, pageState.get().selectedSpace?.id ?? '');
            if (newPath !== '') {
              queryParams.set(pathQueryKey, newPath);
            } else {
              queryParams.delete(pathQueryKey);
            }
            history.push({ search: queryParams.toString() });
          }}
        />
        <DocumentSpaceActions
          show={pageState.selectedSpace.value != null && !documentSpacePrivilegesService.isPromised}
          isMobile={deviceInfo.deviceBySize <= DeviceSize.TABLET || deviceInfo.isMobile}
          selectedSpace={pageState.selectedSpace}
          path={pageState.nested('path')}
          shouldUpdateInfiniteCache={pageState.shouldUpdateInfiniteCache}
          createEditElementOpType={pageState.createEditElementOpType}
          membershipsState={pageState.membershipsState}
          selectedFiles={pageState.selectedFiles}
          showDeleteSelectedDialog={pageState.showDeleteSelectedDialog}
          className="content-controls"
        />
      </div>
      {pageState.selectedSpace.value != null &&
        pageState.datasource.value &&
        documentSpacePrivilegesService.isAuthorizedForAction(
          pageState.selectedSpace.value.id,
          DocumentSpacePrivilegeDtoTypeEnum.Read
        ) && (
          <FullPageInfiniteGrid
            columns={documentDtoColumns.attach(Downgraded).value}
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
            suppressRowClickSelection
            autoResizeColumns
            updateInfiniteCache={pageState.shouldUpdateInfiniteCache.value}
            updateInfiniteCacheCallback={onInfiniteCacheUpdateCallback}
          />
        )}

      <SideDrawer
        isLoading={false}
        title="Add New Document Space"
        isOpen={pageState.drawerOpen.get()}
        onCloseHandler={closeDrawer}
        size={pageState.sideDrawerSize.get()}
      >
        {pageState.drawerOpen.get() && (
          <DocumentSpaceEditForm
            onCancel={closeDrawer}
            onSubmit={submitDocumentSpace}
            isFormSubmitting={pageState.isSubmitting.get()}
            formActionType={FormActionType.ADD}
            onCloseErrorMsg={closeErrorMsg}
            showErrorMessage={pageState.showErrorMessage.get()}
            errorMessage={pageState.errorMessage.get()}
          />
        )}
      </SideDrawer>
      <SideDrawer
        isLoading={false}
        title={getCreateEditTitle(pageState.createEditElementOpType.get())}
        isOpen={pageState.createEditElementOpType.get() !== CreateEditOperationType.NONE}
        onCloseHandler={() => mergeState(pageState, { createEditElementOpType: CreateEditOperationType.NONE })}
        size={pageState.sideDrawerSize.get()}
      >
        {pageState.createEditElementOpType.get() !== CreateEditOperationType.NONE && (
          <DocumentSpaceCreateEditForm
            onCancel={() =>
              mergeState(pageState, {
                showErrorMessage: false,
                createEditElementOpType: CreateEditOperationType.NONE,
                clickedItemName: undefined,
              })
            }
            onSubmit={submitElementName}
            isFormSubmitting={pageState.isSubmitting.get()}
            onCloseErrorMsg={closeErrorMsg}
            showErrorMessage={pageState.showErrorMessage.get()}
            errorMessage={pageState.errorMessage.get()}
            elementName={pageState.clickedItemName.get() ?? ''}
            opType={pageState.createEditElementOpType.get()}
          />
        )}
      </SideDrawer>
      <SideDrawer
        isLoading={false}
        title="My Settings"
        isOpen={pageState.isDefaultDocumentSpaceSettingsOpen.get()}
        onCloseHandler={closeMySettingsDrawer}
        size={SideDrawerSize.WIDE}
        titleStyle={{ color: '#5F96EA', marginTop: -2 }}
        preTitleNode={
          <div style={{ padding: '4px 4px 4px 4px', border: '1px solid #E5E5E5', borderRadius: 4, marginRight: 14 }}>
            <UserIconCircle size={0} />
          </div>
        }
      >
        <DocumentSpaceMySettingsForm
          onCancel={closeMySettingsDrawer}
          onSubmit={submitDefaultDocumentSpace}
          isFormSubmitting={pageState.isSubmitting.get()}
          formActionType={FormActionType.SAVE}
          documentSpaces={documentSpaceService.documentSpaces}
          authorizedUserService={authorizedUserService}
        />
      </SideDrawer>

      <ArchiveDialog
        show={pageState.showDeleteDialog.get() || pageState.showDeleteSelectedDialog.get()}
        onCancel={closeRemoveDialog}
        onSubmit={archiveFile}
        items={pageState.selectedFiles.get()}
      />

      {pageState.selectedSpace.value &&
        !documentSpacePrivilegesService.isPromised &&
        documentSpacePrivilegesService.isAuthorizedForAction(
          pageState.selectedSpace.value.id,
          DocumentSpacePrivilegeDtoTypeEnum.Membership
        ) && (
          <DocumentSpaceMemberships
            documentSpaceId={pageState.selectedSpace.value.id}
            isOpen={pageState.membershipsState.isOpen.value}
            onSubmit={() => pageState.membershipsState.isOpen.set(false)}
            onCloseHandler={() => pageState.membershipsState.isOpen.set(false)}
          />
        )}
    </PageFormat>
  );
}

export default DocumentSpacePage;

import { none, State } from '@hookstate/core';
import { MutableRefObject } from 'react';
import { InfiniteScrollOptions } from '../../../components/DataCrudFormPage/infinite-scroll-options';
import { PopupMenuItem } from '../../../components/DocumentRowActionCellRenderer/DocumentRowActionCellRenderer';
import { GridSelectionType } from '../../../components/Grid/grid-selection-type';
import GridColumn from '../../../components/Grid/GridColumn';
import { SideDrawerSize } from '../../../components/SideDrawer/side-drawer-size';
import { ToastType } from '../../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../../components/Toast/ToastUtils/ToastUtils';
import { DeviceInfo, DeviceSize } from '../../../hooks/PageResizeHook';
import DownloadMaterialIcon from '../../../icons/DownloadMaterialIcon';
import {
  DocumentDto,
  DocumentSpacePathItemsDto,
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceRequestDto,
  DocumentSpaceResponseDto,
  DocumentSpaceUserCollectionResponseDto,
  RecentDocumentDto
} from '../../../openapi';
import { pathQueryKey, spaceIdQueryKey } from '../../../pages/DocumentSpace/DocumentSpaceSelector';
import { performActionWhenMounted } from '../../../utils/component-utils';
import { CreateEditOperationType } from '../../../utils/document-space-utils';
import { prepareRequestError } from '../../../utils/ErrorHandling/error-handling-utils';
import { getPathFileName, joinPathParts } from '../../../utils/file-utils';
import AuthorizedUserService from '../../authorized-user/authorized-user-service';
import { AbstractGlobalStateService } from '../../global-service/abstract-global-state-service';
import { PrivilegeType } from '../../privilege/privilege-type';
import DocumentSpaceDownloadUrlService from '../document-space-download-url-service';
import DocumentSpaceGlobalService from '../document-space-global-service';
import DocumentSpacePrivilegeService from '../document-space-privilege-service';
import DocumentSpaceService from '../document-space-service';
import { ClipBoardState } from '../document-space-state';
import { SpacesPageState } from './spaces-page-state';

export default class SpacesPageService extends AbstractGlobalStateService<SpacesPageState> {
  private downloadService = new DocumentSpaceDownloadUrlService();

  constructor(
    public spacesState: State<SpacesPageState>,
    private mountedRef: MutableRefObject<boolean>,
    private authorizedUserService: AuthorizedUserService,
    private documentSpaceGlobalService: DocumentSpaceGlobalService,
    private documentSpaceService: DocumentSpaceService,
    private documentSpacePrivilegesService: DocumentSpacePrivilegeService,
    private documentSpaceClipboardState: State<ClipBoardState | undefined>
  ) {
    super(spacesState);
  }

  private scrollOptions(): InfiniteScrollOptions {
    return {
      enabled: true,
      limit: 100,
    };
  }

  get infiniteScrollOptions(): InfiniteScrollOptions {
    return this.scrollOptions();
  }

  get recentUploadsScrollOptions(): InfiniteScrollOptions {
    return this.scrollOptions();
  }

  get searchScrollOptions(): InfiniteScrollOptions {
    return this.scrollOptions();
  }

  isAdmin() {
    return this.authorizedUserService.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN);
  }

  locationIncludesDocumentSpace(currentUrlSearchParams: string) {
    const queryParams = new URLSearchParams(currentUrlSearchParams);
    return queryParams.get(spaceIdQueryKey) != null;
  }

  async loadDocumentSpaces() {
    const spacesCancellableRequest = this.documentSpaceService.fetchAndStoreSpaces();

    try {
      return await spacesCancellableRequest.promise;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  getInitialDocumentSpace() {
    return this.documentSpaceGlobalService.getInitialSelectedDocumentSpace(
      this.documentSpaceService.documentSpaces,
      this.authorizedUserService.authorizedUser?.defaultDocumentSpaceId
    );
  }

  getUrlParametersForSpaceAndPath(documentSpaceId: string, path?: string): URLSearchParams {
    const queryParams = new URLSearchParams();
    queryParams.set(spaceIdQueryKey, documentSpaceId);

    if (path != null) {
      queryParams.set(pathQueryKey, path);
    }

    return queryParams;
  }

  loadDocSpaceFromLocation(currentUrlSearchParams: string, onNoSpaceFound?: () => void) {
    const queryParams = new URLSearchParams(currentUrlSearchParams);
    const documentSpaces = this.documentSpaceService.documentSpaces;

    if (queryParams.get(spaceIdQueryKey) != null && documentSpaces.length > 0) {
      const selectedDocumentSpace = documentSpaces.find(
        (documentSpace) => documentSpace.id === queryParams.get('spaceId')
      );
      if (selectedDocumentSpace == null) {
        if (onNoSpaceFound !== undefined) {
          onNoSpaceFound();
        }
        this.mergeState({ spaceNotFound: true });
        return;
      }

      const path = queryParams.get(pathQueryKey) ?? '';
      if (
        selectedDocumentSpace.id !== this.spacesState.get().selectedSpace?.id ||
        path !== this.spacesState.get().path
      ) {
        this.setStateOnDocumentSpaceAndPathChange(selectedDocumentSpace, path);
      }
    }
  }

  // helper to handle the column resizing action - it is bound to the appropriate effect
  // in the calling functional component - it basically hides everything except the item name and its "more" column
  // and moves the download action cell into the "more" menu on small screens
  handleColumnsOnResize(documentDtoColumns: State<GridColumn[]>, deviceInfo: DeviceInfo) {
    let columnsToKeep: string[];
    
    if (deviceInfo.deviceBySize <= DeviceSize.MOBILE) {      
      columnsToKeep = [ 'key' ];
    } else if (deviceInfo.deviceBySize <= DeviceSize.DESKTOP) {
      columnsToKeep = [ 'key', 'lastModifiedDate' ];
    } else {
      columnsToKeep = documentDtoColumns.map(column => column.field.value);
    }

    // sometimes on initial render, if ag-grid isn't up, the width is shown to be 0, which is
    // invalid, so just don't do anything
    if (deviceInfo.deviceBySize === 0) return;

    const hideableColumns = documentDtoColumns.filter(column => !columnsToKeep.includes(column.field.value)
      && column.headerName.value !== 'More');

    if (deviceInfo.isMobile || deviceInfo.deviceBySize <= DeviceSize.DESKTOP) {
      hideableColumns.forEach(column => {
        column.hide.set(true)
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
            onClick: (doc: DocumentDto) => this.conditionalMenuDownloadOnClick(doc)
          });

          return state;
        });
      }
    } else {
      hideableColumns.forEach(column => {
        column.hide.set(false)
      });

      // if we're full width, unhide everything in case hideableColumns was empty
      //  this state can happen on expanding the screen back to wider than desktop
      if (hideableColumns && hideableColumns.length === 0) {
        documentDtoColumns.forEach(column => column.hide.set(false));
      }

      // Remove Download from "More" actions cell renderer
      const moreActionsColumn = documentDtoColumns.find(column => column.headerName.value === 'More');
      (moreActionsColumn?.cellRendererParams as State<{ menuItems: PopupMenuItem<DocumentDto>[] }>).menuItems.find(menuItem => menuItem.title.value === 'Download')?.set(none);
    }
  }

  // receive the search query and creates a datasource around it to initiate the API call/results
  submitSearchQuery(query: string | undefined) {
    if (this.spacesState && this.spacesState.selectedSpace.value != undefined && query) {
      this.spacesState.merge({
        shouldUpdateSearchDatasource: true,
        searchDatasource: this.documentSpaceService.createSearchDatasource(this.spacesState.selectedSpace.value.id, this.searchScrollOptions, query),
      });
    }
  }

  // helper to decide what happens on a download link click - nothing, if its a folder and has no contents...
  //  note the use of "new DocumentSpaceDownloadUrlService()" here, this is because of some funkiness with calling
  //  bound functions from a functional component's hook it seems
  conditionalMenuDownloadOnClick(doc: DocumentDto) {
    if (doc.folder && !doc.hasContents) {
      createTextToast(ToastType.WARNING, 'Unable to download a folder with no contents');
    } else if (doc.folder) {
      window.location.href = new DocumentSpaceDownloadUrlService().createRelativeFilesDownloadUrl(doc.spaceId, doc.path, [doc]);
    } else {
      window.location.href = new DocumentSpaceDownloadUrlService().createRelativeDownloadFileUrl(doc.spaceId, doc.path, doc.key, true);
    }
  }

  async setStateOnDocumentSpaceAndPathChange(documentSpace: DocumentSpaceResponseDto, path: string) {
    try {
      // Don't need to load privileges if current user is Dashboard Admin,
      // since they currently have access to everything Document Space related
      if (!this.isAdmin()) {
        await this.documentSpacePrivilegesService.fetchAndStoreDashboardUserDocumentSpacePrivileges(documentSpace.id)
          .promise;
      }
      const favorites: DocumentSpaceUserCollectionResponseDto[] = await this.documentSpaceService.getFavorites(
        documentSpace.id
      );

      this.mergeState({
        selectedSpace: documentSpace,
        shouldUpdateDatasource: true,
        shouldUpdateRecentsDatasource: true,
        datasource: this.documentSpaceService.createDatasource(documentSpace.id, path, this.infiniteScrollOptions),
        recentsDatasource: this.documentSpaceService.createRecentUploadsForSpaceDatasource(documentSpace.id, this.recentUploadsScrollOptions),
        searchDatasource: this.documentSpaceService.createSearchDatasource(documentSpace.id, this.searchScrollOptions, undefined),
        path,
        selectedFiles: [],
        showNoChosenSpace: false,
        favorites,
      });
    } catch (err) {
      if (!this.mountedRef.current) {
        return;
      }

      const preparedError = prepareRequestError(err);

      if (preparedError.status === 403) {
        createTextToast(ToastType.ERROR, 'Not authorized for the selected Document Space');
      } else {
        createTextToast(ToastType.ERROR, 'Could not load privileges for the selected Document Space');
      }

      this.mergeState({
        selectedSpace: undefined,
        datasource: undefined,
        recentsDatasource: undefined,
        shouldUpdateDatasource: false,
        shouldUpdateRecentsDatasource: false,
        showNoChosenSpace: false,
        selectedFiles: [],
      });
    }
  }

  getDocumentUniqueKey(data: DocumentDto): string {
    return data.path + '__' + data.key;
  }

  userIsAuthorizedForWriteInSpace(doc: DocumentDto): boolean {
    return doc != null && this.documentSpacePrivilegesService.isAuthorizedForAction(doc.spaceId,
      DocumentSpacePrivilegeDtoTypeEnum.Write
    );
  }

  onDocumentRowSelected(data: DocumentDto, selectionEvent: GridSelectionType) {
    const selectedFiles = this.spacesState.selectedFiles;
    if (selectionEvent === 'selected') {
      selectedFiles[selectedFiles.length].set(data);
    } else {
      selectedFiles.find((document) => document.key.value === data.key)?.set(none);
    }
  }

  async submitDocumentSpace(space: DocumentSpaceRequestDto) {
    this.spacesState.merge({ isSubmitting: true });

    try {
      const createdSpace = await this.documentSpaceService.createDocumentSpace(space);
      this.mergeState({
        drawerOpen: false,
        isSubmitting: false,
        showErrorMessage: false,
      });

      return createdSpace;
    } catch (error) {
      this.setPageStateOnException(error as string);
      return Promise.reject(error);
    }
  }

  submitDefaultDocumentSpace(spaceId: string) {
    this.spacesState.merge({ isSubmitting: true });
    this.documentSpaceService
      .patchDefaultDocumentSpace(spaceId)
      .then((docSpaceId) => {
        this.authorizedUserService.setDocumentSpaceDefaultId(docSpaceId);
        this.mergeState({
          isDefaultDocumentSpaceSettingsOpen: false,
          isSubmitting: false,
          showErrorMessage: false,
          path: '',
        });
        createTextToast(ToastType.SUCCESS, 'User Default Space Updated');
      })
      .catch((message) => {
        this.setPageStateOnException(message);
        createTextToast(ToastType.ERROR, 'Space update failed: ' + message);
      });
  }

  submitElementName(name: string) {
    if (this.spacesState.selectedSpace.value?.id === undefined) return;

    this.spacesState.merge({ isSubmitting: true });

    switch (this.spacesState.createEditElementOpType.get()) {
      case CreateEditOperationType.EDIT_FOLDERNAME:
        if (this.spacesState.selectedFile.value == null) {
          throw new Error('Folder document cannot be null for rename');
        }
        this.documentSpaceService
          .renameFolder(
            this.spacesState.selectedSpace.value?.id,
            this.spacesState.get().path + '/' + this.spacesState.selectedFile.value.key,
            name
          )
          .then(() => {
            this.mergeState({
              createEditElementOpType: CreateEditOperationType.NONE,
              isSubmitting: false,
              showErrorMessage: false,
              shouldUpdateDatasource: true,
              shouldUpdateRecentsDatasource: true,
              selectedFile: undefined,
            });
            createTextToast(ToastType.SUCCESS, 'Folder renamed');
          })
          .catch((message) => this.setPageStateOnException(message));
        break;
      case CreateEditOperationType.CREATE_FOLDER:
        this.documentSpaceService
          .createNewFolder(this.spacesState.selectedSpace.value?.id, this.spacesState.get().path, name)
          .then(() => {
            this.mergeState({
              createEditElementOpType: CreateEditOperationType.NONE,
              isSubmitting: false,
              showErrorMessage: false,
              shouldUpdateDatasource: true,
              shouldUpdateRecentsDatasource: true,
            });
            createTextToast(ToastType.SUCCESS, 'Folder created');
          })
          .catch((message) => this.setPageStateOnException(message));
        break;
      case CreateEditOperationType.EDIT_FILENAME:
        if (this.spacesState.selectedFile.value == null) {
          throw new Error('File document cannot be null for rename');
        }
        this.documentSpaceService
          .renameFile(
            this.spacesState.selectedSpace.value?.id,
            this.spacesState.get().path,
            this.spacesState.selectedFile.value.key,
            name
          )
          .then(() => {
            this.mergeState({
              createEditElementOpType: CreateEditOperationType.NONE,
              isSubmitting: false,
              showErrorMessage: false,
              shouldUpdateDatasource: true,
              shouldUpdateRecentsDatasource: true,
              selectedFile: undefined,
            });
            createTextToast(ToastType.SUCCESS, 'File renamed');
          })
          .catch((message) => this.setPageStateOnException(message));
        break;
      default:
        break;
    }
  }

  async addToFavorites(doc: DocumentDto) {
    if (this.spacesState.selectedSpace?.value !== undefined) {
      const reqDto: DocumentSpacePathItemsDto = { currentPath: doc.path, items: [doc.key] };

      try {
        await this.documentSpaceService.addPathEntityToFavorites(this.spacesState.selectedSpace.value.id, reqDto);

        const placeHolderResponse: DocumentSpaceUserCollectionResponseDto = {
          metadata: {},
          id: '',
          itemId: '',
          documentSpaceId: doc.spaceId,
          key: doc.key,
          path: doc.path,
          lastModifiedDate: '',
          folder: doc.folder,
          lastActivity: new Date().toISOString(),
        };

        performActionWhenMounted(this.mountedRef.current, () => {
          this.spacesState.favorites.merge([placeHolderResponse]);
          this.spacesState.shouldUpdateDatasource.set(true);

          createTextToast(ToastType.SUCCESS, 'Successfully added to favorites');
        });
      } catch (error) {
        createTextToast(ToastType.ERROR, 'Failed to add to favorites - ' + (error as Error).message);
      }
    } else {
      createTextToast(ToastType.ERROR, 'Could not add to favorites');
    }
  }

  async removeFromFavorites(doc: DocumentDto) {
    if (this.spacesState.selectedSpace?.value !== undefined) {
      const reqDto: DocumentSpacePathItemsDto = { currentPath: doc.path, items: [doc.key] };
      try {
        await this.documentSpaceService.removePathEntityFromFavorites(this.spacesState.selectedSpace.value.id, reqDto);
        if (this.spacesState.favorites.value.length) {
          performActionWhenMounted(this.mountedRef.current, () => {
            this.spacesState.favorites.set((favorites) => {
              return favorites.filter((f) => f.key !== doc.key);
            });
            this.spacesState.shouldUpdateDatasource.set(true);

            createTextToast(ToastType.SUCCESS, 'Successfully removed from favorites');
          });
        }
      } catch (error) {
        createTextToast(ToastType.ERROR, 'Failed to remove favorites - ' + (error as Error).message);
      }
    } else {
      createTextToast(ToastType.ERROR, 'Could not remove from favorites');
    }
  }

  getFavoritesShouldShow(doc: DocumentDto, addingToFavorites: boolean) {
    const foundInFavorites = this.spacesState.favorites?.value?.some((favorite) => {
      if (doc == null) {
        return false;
      }
      return favorite.key === doc.key && favorite.path?.replace(/^\/+/, '') === doc.path?.replace(/^\/+/, '');
    });

    return addingToFavorites ? !foundInFavorites : foundInFavorites;
  }

  setStateOnArchive() {
    this.spacesState.merge((state) => {
      state.shouldUpdateDatasource = true;
      state.shouldUpdateRecentsDatasource = true;
      state.datasource = this.documentSpaceService.createDatasource(
        this.spacesState.get().selectedSpace?.id ?? '',
        this.spacesState.get().path,
        this.infiniteScrollOptions
      );
      state.selectedFile = undefined;
      state.selectedFiles = [];

      return state;
    });

    this.closeRemoveDialog();
  }

  async archiveFile(isSingle = false): Promise<void> {
    const selectedSpace = this.spacesState.selectedSpace.value;

    if (selectedSpace == null) {
      return;
    }

    let items: DocumentDto[];

    if (isSingle) {
      if (this.spacesState.selectedFile.value == null) {
        throw new Error('Selected file cannot be null for archive');
      } else {
        items = [this.spacesState.selectedFile.value];
      }
    } else {
      items = this.spacesState.selectedFiles.value;
    }

    try {
      await this.documentSpaceService.archiveItems(
        selectedSpace.id,
        this.spacesState.get().path,
        items.map((item) => item.key)
      );
      createTextToast(ToastType.SUCCESS, 'Item(s) Archived');
    } catch (e) {
      createTextToast(ToastType.ERROR, 'Could not archive item(s) - ' + (e as Error).message);
    } finally {
      performActionWhenMounted(this.mountedRef.current, () => this.setStateOnArchive());
    }
  }

  mergeState(state: Partial<SpacesPageState>) {
    performActionWhenMounted(this.mountedRef.current, () => this.spacesState.merge(state));
  }

  closeDrawer(): void {
    this.spacesState.merge({ drawerOpen: false });
  }

  closeMySettingsDrawer(): void {
    this.spacesState.merge({ isDefaultDocumentSpaceSettingsOpen: false });
  }

  closeErrorMsg(): void {
    this.spacesState.merge({ showErrorMessage: false });
  }

  closeRemoveDialog(): void {
    this.spacesState.merge({ showDeleteDialog: false, showDeleteSelectedDialog: false });
  }

  onDatasourceUpdateCallback() {
    this.mergeState({
      shouldUpdateDatasource: false,
    });
  }

  onRecentsDatasourceUpdateCallback() {
    this.mergeState({
      shouldUpdateRecentsDatasource: false,
    });
  }

  onSearchDatasourceUpdateCallback() {
    this.mergeState({
      shouldUpdateSearchDatasource: false,
    });
  }

  setPageStateOnException(message: string) {
    this.mergeState({
      isSubmitting: false,
      errorMessage: message,
      showErrorMessage: true,
    });
  }

  /**
   * Places what ever is in the selected items state onto the clipboard marked as a copy operation
   */
  copySelectedItems() {
    this.documentSpaceClipboardState.set({
      sourceSpace: this.state.selectedFiles.value[0].spaceId,
      isCopy: true,
      items: this.state.selectedFiles.value.map((item) => joinPathParts(item.path, item.key)),
    });
    createTextToast(ToastType.SUCCESS, 'Items selected for COPY!');
  }

  /**
   * Places what ever is in the selected items state onto the clipboard marked as a cut operation (move)
   */
  cutSelectedItems() {
    this.documentSpaceClipboardState.set({
      sourceSpace: this.state.selectedFiles.value[0].spaceId,
      isCopy: false,
      items: this.state.selectedFiles.value.map((item) => joinPathParts(item.path, item.key)),
    });
    createTextToast(ToastType.SUCCESS, 'Items selected for CUT!');
  }

  /**
   * Performs either the cut or copy operation for the items in the clipboard state and then clears
   * the clipboard always
   */
  async pasteItems() {
    if (this.documentSpaceClipboardState.value && this.state.selectedSpace.value) {
      const srcDestMap: Record<string, string> = {};
      for (const item of this.documentSpaceClipboardState.value.items) {
        srcDestMap[item] = joinPathParts(this.state.get().path, getPathFileName(item));
      }
      try {
        if (this.documentSpaceClipboardState.value.isCopy) {
          await this.documentSpaceService.copyFiles(this.state.selectedSpace.value.id, this.documentSpaceClipboardState.value.sourceSpace, srcDestMap);
        } else {
          await this.documentSpaceService.moveFiles(this.state.selectedSpace.value.id, this.documentSpaceClipboardState.value.sourceSpace, srcDestMap);
        }

        createTextToast(ToastType.SUCCESS, 'Items pasted!');
      } catch (e) {
        createTextToast(ToastType.ERROR, e as string);
      } finally {
        this.documentSpaceClipboardState.set(undefined);
        this.mergeState({ shouldUpdateDatasource: true, 
          shouldUpdateRecentsDatasource: true });
      }
    } else {
      createTextToast(ToastType.WARNING, 'Nothing to paste!');
    }
  }

  resetState() {
    this.spacesState.set({
      drawerOpen: false,
      isSubmitting: false,
      showErrorMessage: false,
      errorMessage: '',
      selectedSpace: undefined,
      shouldUpdateDatasource: false,
      datasource: undefined,
      shouldUpdateRecentsDatasource: false,
      recentsDatasource: undefined,
      shouldUpdateSearchDatasource: false,
      searchDatasource: undefined,
      showUploadDialog: false,
      showDeleteDialog: false,
      fileToDelete: '',
      selectedFile: undefined,
      selectedFiles: [],
      membershipsState: {
        isOpen: false,
      },
      createEditElementOpType: CreateEditOperationType.NONE,
      path: '',
      showDeleteSelectedDialog: false,
      isDefaultDocumentSpaceSettingsOpen: false,
      sideDrawerSize: SideDrawerSize.WIDE,
      favorites: [],
      spaceNotFound: false,
      showNoChosenSpace: false,
      showFolderSizeDialog: false,
      selectedItemForSize: undefined,
    });

    this.documentSpaceService.resetState();
    this.documentSpacePrivilegesService.resetState();
  }
}

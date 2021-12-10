import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { waitFor } from '@testing-library/dom';
import axios from 'axios';
import { MutableRefObject } from 'react';
import { SideDrawerSize } from '../../../../components/SideDrawer/side-drawer-size';
import { ToastType } from '../../../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../../../components/Toast/ToastUtils/ToastUtils';
import { DashboardUserControllerApi, DashboardUserDto, DocumentDto, DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpacePrivilegeDtoTypeEnum, DocumentSpaceResponseDto, DocumentSpaceUserCollectionResponseDto } from '../../../../openapi';
import { pathQueryKey, spaceIdQueryKey } from '../../../../pages/DocumentSpace/DocumentSpaceSelector';
import AuthorizedUserService from '../../../../state/authorized-user/authorized-user-service';
import DocumentSpacePrivilegeService from '../../../../state/document-space/document-space-privilege-service';
import DocumentSpaceService from '../../../../state/document-space/document-space-service';
import { CancellableDataRequest } from '../../../../utils/cancellable-data-request';
import { createGenericAxiosRequestErrorResponse } from '../../../../utils/TestUtils/test-utils';
import DocumentSpaceGlobalService, { DocumentSpaceGlobalState } from '../../document-space-global-service';
import { CreateEditOperationType } from '../../document-space-utils';
import SpacesPageService from '../spaces-page-service';
import { SpacesPageState } from '../spaces-page-state';

jest.mock('../../../../components/Toast/ToastUtils/ToastUtils');

describe('Spaces Page Service Test', () => {
  const documents: DocumentDto[] = [
    {
      key: 'files (2).zip',
      path: '',
      spaceId: '1426ed7e-b782-4ee4-80d9-e9f5c8ec2398',
      spaceName: undefined,
      size: 5849936,
      lastModifiedDate: '2021-12-03T07:44:48.824Z',
      lastModifiedBy: 'dnakamoto.ctr@revacomm.com',
      hasContents: false,
      folder: false
    },
    {
      key: 'files (1).zip',
      path: '',
      spaceId: '1426ed7e-b782-4ee4-80d9-e9f5c8ec2322',
      spaceName: undefined,
      size: 123123,
      lastModifiedDate: '2021-12-10T07:44:48.824Z',
      lastModifiedBy: 'dnakamoto.ctr@revacomm.com',
      hasContents: false,
      folder: false
    },
  ];

  const favorites: DocumentSpaceUserCollectionResponseDto[] = [
    {
      id: 'id1',
      itemId: 'itemId1',
      documentSpaceId: documents[0].spaceId,
      key: documents[0].key,
      lastModifiedDate: documents[0].lastModifiedDate,
      folder: documents[0].folder,
      metadata: {}
    }
  ];


  const documentSpaces: DocumentSpaceResponseDto[] = [
    {
      id: '412ea028-1fc5-41e0-b48a-c6ef090704d3',
      name: 'space1',
    },
    {
      id: '52909027-69f6-4d0c-83da-293bc2d9d2f8',
      name: 'space2',
    }
  ];

  let documentSpacesState: State<DocumentSpaceResponseDto[]> & StateMethodsDestroy;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;

  let documentSpacePrivilegeState: State<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>;
  let documentSpacePrivilegeService: DocumentSpacePrivilegeService;

  let globalDocumentSpaceState: State<DocumentSpaceGlobalState>;
  let globalDocumentSpaceService: DocumentSpaceGlobalService;

  let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy;
  let dashboardUserApi: DashboardUserControllerApi;
  let authorizedUserService: AuthorizedUserService;

  let mountedRef: MutableRefObject<boolean>;

  let spacesState: State<SpacesPageState>;
  let spacesService: SpacesPageService;

  let createTextToastMock: jest.Mock<void, [toastType: ToastType, message: string]>;

  beforeEach(() => {
    documentSpaceApi = new DocumentSpaceControllerApi();

    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);

    documentSpacePrivilegeState = createState<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>({});
    documentSpacePrivilegeService = new DocumentSpacePrivilegeService(
      documentSpaceApi,
      documentSpacePrivilegeState
    );

    authorizedUserState = createState<DashboardUserDto | undefined>(undefined);
    dashboardUserApi = new DashboardUserControllerApi();
    authorizedUserService = new AuthorizedUserService(authorizedUserState, dashboardUserApi);

    globalDocumentSpaceState = createState<DocumentSpaceGlobalState>({
      currentDocumentSpace: undefined
    });
    globalDocumentSpaceService = new DocumentSpaceGlobalService(globalDocumentSpaceState);

    mountedRef = {
      current: true
    };

    spacesState = createState<SpacesPageState>({
      drawerOpen: false,
      isSubmitting: false,
      showErrorMessage: false,
      errorMessage: '',
      selectedSpace: undefined,
      shouldUpdateDatasource: false,
      datasource: undefined,
      showUploadDialog: false,
      showDeleteDialog: false,
      fileToDelete: '',
      selectedFile: undefined,
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

    spacesService = new SpacesPageService(
      spacesState,
      mountedRef,
      authorizedUserService,
      globalDocumentSpaceService,
      documentSpaceService,
      documentSpacePrivilegeService
    );

    createTextToastMock = jest.fn((toastType: ToastType, message: string) => { return; });
    (createTextToast as jest.Mock).mockImplementation(createTextToastMock);

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should return if authorized user is admin', () => {
    const hasPrivilegeSpy = jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege');

    hasPrivilegeSpy.mockReturnValue(true);
    expect(spacesService.isAdmin()).toEqual(true);

    hasPrivilegeSpy.mockReturnValue(false);
    expect(spacesService.isAdmin()).toEqual(false);
  });

  it('should determine if search param contains document space id', () => {
    expect(spacesService.locationIncludesDocumentSpace('')).toEqual(false);

    const locationWithSpaceId = spacesService.getUrlParametersForSpaceAndPath(documentSpaces[0].id);
    expect(spacesService.locationIncludesDocumentSpace(locationWithSpaceId.toString())).toEqual(true);
  });

  it('should handle loading document spaces', async () => {
    const fetchSpaces = jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces');

    // Success
    fetchSpaces.mockReturnValue({
      promise: Promise.resolve(documentSpaces),
      cancelTokenSource: axios.CancelToken.source()
    });
    let loadSpaces = spacesService.loadDocumentSpaces();
    await expect(loadSpaces).resolves.toEqual(documentSpaces);

    // Failure
    fetchSpaces.mockReturnValue({
      promise: Promise.reject(Error('failure')),
      cancelTokenSource: axios.CancelToken.source()
    });
    loadSpaces = spacesService.loadDocumentSpaces();
    await expect(loadSpaces).rejects.toEqual(Error('failure'));
  });

  it('should get default document space', () => {
    jest.spyOn(globalDocumentSpaceService, 'getInitialSelectedDocumentSpace').mockReturnValue(documentSpaces[0]);

    expect(spacesService.getInitialDocumentSpace()).toEqual(documentSpaces[0]);
  });

  it('should create url search params for document space and path', () => {
    const searchParams = spacesService.getUrlParametersForSpaceAndPath(documentSpaces[0].id, 'test');
    expect(searchParams.get(spaceIdQueryKey)).toEqual(documentSpaces[0].id);
    expect(searchParams.get(pathQueryKey)?.includes('test')).toEqual(true);
  });

  describe('should handle loading document space from url location', () => {
    let setStateOnSpaceOrPathChangeSpy: jest.SpyInstance<Promise<void>, [documentSpace: DocumentSpaceResponseDto, path: string]>;

    beforeEach(() => {
      jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);
      setStateOnSpaceOrPathChangeSpy = jest.spyOn(spacesService, 'setStateOnDocumentSpaceAndPathChange');
    });

    it('should handle success', () => {
      const searchParams = spacesService.getUrlParametersForSpaceAndPath(documentSpaces[0].id, '');

      spacesService.loadDocSpaceFromLocation(searchParams.toString());

      expect(setStateOnSpaceOrPathChangeSpy).toHaveBeenCalled();
    });

    it('should handle non-success (space does not exist in state)', () => {
      const searchParams = spacesService.getUrlParametersForSpaceAndPath('fake id', '');

      spacesService.loadDocSpaceFromLocation(searchParams.toString());

      expect(createTextToastMock).toHaveBeenCalledWith(ToastType.ERROR, 'Could not process the selected Document Space');
      expect(setStateOnSpaceOrPathChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('state changes on Document Space / path change', () => {
    let isAdminSpy: jest.SpyInstance<boolean, []>;
    let privilegesSpy: jest.SpyInstance<CancellableDataRequest<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>>;
    let favoritesRequestSpy: jest.SpyInstance<Promise<DocumentSpaceUserCollectionResponseDto[]>, [documentSpaceId: string]>;
    beforeEach(() => {
      isAdminSpy = jest.spyOn(spacesService, 'isAdmin');
      privilegesSpy = jest.spyOn(documentSpacePrivilegeService, 'fetchAndStoreDashboardUserDocumentSpacePrivileges');
      favoritesRequestSpy = jest.spyOn(documentSpaceService, 'getFavorites');
    });

    afterEach(() => {
      spacesService.resetState();
    });

    it('should send request for privileges dependent on authorized user containing DASHBOARD_ADMIN', async () => {
      // Should not request privileges when admin
      isAdminSpy.mockReturnValue(true);
      let stateChange = spacesService.setStateOnDocumentSpaceAndPathChange(documentSpaces[0], '');

      await stateChange;
      expect(privilegesSpy).not.toHaveBeenCalled();
      expect(favoritesRequestSpy).toHaveBeenCalledTimes(1);

      // Should request privileges when admin
      isAdminSpy.mockReturnValue(false);
      stateChange = spacesService.setStateOnDocumentSpaceAndPathChange(documentSpaces[0], '');
      await stateChange;

      expect(privilegesSpy).toHaveBeenCalled();
      expect(favoritesRequestSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle state change on success', async () => {
      isAdminSpy.mockReturnValue(true);
      favoritesRequestSpy.mockReturnValue(Promise.resolve(favorites));

      const stateChange = spacesService.setStateOnDocumentSpaceAndPathChange(documentSpaces[0], '');
      await stateChange;

      expect(spacesState.selectedSpace.value).toEqual(documentSpaces[0]);
      expect(spacesState.shouldUpdateDatasource.value).toEqual(true);
      expect(spacesState.datasource.value).toBeDefined();
      expect(spacesState.value.path).toEqual('');
      expect(spacesState.selectedFiles.value).toEqual([]);
      expect(spacesState.favorites.value).toEqual(favorites);
    });

    it('should handle state change on non-success', async () => {
      isAdminSpy.mockReturnValue(false);
      privilegesSpy.mockReturnValue({
        promise: Promise.reject(createGenericAxiosRequestErrorResponse(403)),
        cancelTokenSource: axios.CancelToken.source()
      });

      const stateChange = spacesService.setStateOnDocumentSpaceAndPathChange(documentSpaces[0], '');
      await stateChange;

      expect(spacesState.selectedSpace.value).toBeUndefined();
      expect(spacesState.shouldUpdateDatasource.value).toEqual(false);
      expect(spacesState.datasource.value).toBeUndefined();
      expect(spacesState.selectedFiles.value).toEqual([]);
    });

    it('should create error toasts', async () => {
      isAdminSpy.mockReturnValue(false);

      // Test 403 toast
      privilegesSpy.mockReturnValue({
        promise: Promise.reject(createGenericAxiosRequestErrorResponse(403)),
        cancelTokenSource: axios.CancelToken.source()
      });

      let stateChange = spacesService.setStateOnDocumentSpaceAndPathChange(documentSpaces[0], '');
      await stateChange;

      expect(createTextToastMock).toHaveBeenCalledWith(ToastType.ERROR, 'Not authorized for the selected Document Space');

      // Test 404 toast
      privilegesSpy.mockReturnValue({
        promise: Promise.reject(createGenericAxiosRequestErrorResponse(404)),
        cancelTokenSource: axios.CancelToken.source()
      });

      stateChange = spacesService.setStateOnDocumentSpaceAndPathChange(documentSpaces[0], '');
      await stateChange;

      expect(createTextToastMock).toHaveBeenCalledWith(ToastType.ERROR, 'Could not load privileges for the selected Document Space');
    });
  });

  it('should generate unique key for DocumentDto', () => {
    expect(spacesService.getDocumentUniqueKey(documents[0])).toEqual(`${documents[0].path}__${documents[0].key}`);
  });

  it('should handle ag grid row selection changes to state', () => {
    expect(spacesState.selectedFiles.value).toEqual([]);

    const documentSelection = documents[0];

    spacesService.onDocumentRowSelected(documentSelection, 'selected');
    expect(spacesState.selectedFiles.value.some(item => item.key === documentSelection.key)).toEqual(true);

    spacesService.onDocumentRowSelected(documentSelection, 'unselected');
    expect(spacesState.selectedFiles.value.some(item => item.key === documentSelection.key)).toEqual(false);
  });

  describe('document space creation tests', () => {
    it('should handle successful creation', async () => {
      const createSpaceSpy = jest.spyOn(documentSpaceService, 'createDocumentSpace')
        .mockReturnValue(new Promise(resolve => setTimeout(() => resolve(documentSpaces[0]), 1000)));

      const createdSpace = spacesService.submitDocumentSpace(documentSpaces[0]);

      expect(spacesState.isSubmitting.value).toEqual(true);
      jest.runOnlyPendingTimers();

      await waitFor(() => expect(createSpaceSpy).toHaveBeenCalled());
      await expect(createdSpace).resolves.toEqual(documentSpaces[0]);

      expect(spacesState.drawerOpen.value).toEqual(false);
      expect(spacesState.isSubmitting.value).toEqual(false);
      expect(spacesState.showErrorMessage.value).toEqual(false);
    });

    it('should handle unsuccessful creation', async () => {
      const createSpaceSpy = jest.spyOn(documentSpaceService, 'createDocumentSpace')
        .mockReturnValue(Promise.reject(Error('failure')));

      const setStateOnExceptionSpy = jest.spyOn(spacesService, 'setPageStateOnException');

      const createdSpace = spacesService.submitDocumentSpace(documentSpaces[0]);

      expect(spacesState.isSubmitting.value).toEqual(true);
      jest.runOnlyPendingTimers();

      await waitFor(() => expect(createSpaceSpy).toHaveBeenCalled());
      await expect(createdSpace).rejects.toEqual(Error('failure'));

      expect(setStateOnExceptionSpy).toHaveBeenCalled();
    });
  });

  describe('set default document space tests', () => {
    it('should handle successful submission of default document space', async () => {
      const defaultDocumentSpaceSpy = jest.spyOn(documentSpaceService, 'patchDefaultDocumentSpace')
        .mockReturnValue(new Promise(resolve => setTimeout(() => resolve(documentSpaces[0].id), 1000)));

      const updateAuthUserSpy = jest.spyOn(authorizedUserService, 'setDocumentSpaceDefaultId');

      spacesService.submitDefaultDocumentSpace(documentSpaces[0].id);

      expect(spacesState.isSubmitting.value).toEqual(true);

      jest.runOnlyPendingTimers();

      await waitFor(() => expect(defaultDocumentSpaceSpy).toHaveBeenCalled());
      await waitFor(() => expect(updateAuthUserSpy).toHaveBeenCalled());

      expect(spacesState.isDefaultDocumentSpaceSettingsOpen.value).toEqual(false);
      expect(spacesState.isSubmitting.value).toEqual(false);
      expect(spacesState.showErrorMessage.value).toEqual(false);
      expect(spacesState.value.path).toEqual('');
    });

    it('should handle unsuccessful submission', async () => {
      const defaultDocumentSpaceSpy = jest.spyOn(documentSpaceService, 'patchDefaultDocumentSpace')
        .mockReturnValue(Promise.reject(Error('failure')));

      const setStateOnExceptionSpy = jest.spyOn(spacesService, 'setPageStateOnException');

      spacesService.submitDefaultDocumentSpace(documentSpaces[0].id);

      await waitFor(() => expect(defaultDocumentSpaceSpy).toHaveBeenCalled());
      await waitFor(() => expect(setStateOnExceptionSpy).toHaveBeenCalled());
    });
  });

  it('submitElementName should do nothing if no space selected in state', () => {
    spacesState.selectedSpace.set(undefined);

    const stateValueBefore = spacesState.value;
    spacesService.submitElementName('new name');

    expect(spacesState.value).toEqual(stateValueBefore);
  });

  describe('file rename tests', () => {
    beforeEach(() => {
      spacesState.selectedSpace.set(documentSpaces[0]);
      spacesState.selectedFile.set(documents[0]);
      spacesState.createEditElementOpType.set(CreateEditOperationType.EDIT_FILENAME);
    });

    afterEach(() => {
      spacesService.resetState();
    });

    it('should handle successful file renames', async () => {
      const renameFileSpy = jest.spyOn(documentSpaceService, 'renameFile')
        .mockReturnValue(new Promise(resolve => setTimeout(() => resolve(), 1000)));

      spacesService.submitElementName('new name');

      expect(spacesState.isSubmitting.value).toEqual(true);

      jest.runOnlyPendingTimers();

      await waitFor(() => expect(renameFileSpy).toHaveBeenCalled());

      expect(spacesState.createEditElementOpType.value).toEqual(CreateEditOperationType.NONE);
      expect(spacesState.isSubmitting.value).toEqual(false);
      expect(spacesState.showErrorMessage.value).toEqual(false);
      expect(spacesState.shouldUpdateDatasource.value).toEqual(true);
      expect(spacesState.selectedFile.value).toEqual(undefined);

      expect(createTextToastMock).toHaveBeenCalledWith(ToastType.SUCCESS, 'File renamed');
    });

    it('should handle unsuccessful file renames', async () => {
      const renameFileSpy = jest.spyOn(documentSpaceService, 'renameFile').mockReturnValue(Promise.reject(Error('failure')));
      const setStateOnExceptionSpy = jest.spyOn(spacesService, 'setPageStateOnException');

      spacesService.submitElementName('new name');

      await waitFor(() => expect(renameFileSpy).toHaveBeenCalled());
      await waitFor(() => expect(setStateOnExceptionSpy).toHaveBeenCalled());
    });

    it('should throw when state invalid (selected file in state not set)', () => {
      spacesState.selectedFile.set(undefined);

      expect(() => spacesService.submitElementName('new name')).toThrowError('File document cannot be null for rename');
    });
  });

  describe('folder creation tests', () => {
    beforeEach(() => {
      spacesState.selectedSpace.set(documentSpaces[0]);
      spacesState.selectedFile.set(documents[0]);
      spacesState.createEditElementOpType.set(CreateEditOperationType.CREATE_FOLDER);
    });

    afterEach(() => {
      spacesService.resetState();
    });

    it('should handle successful folder creation', async () => {
      const createFolderSpy = jest.spyOn(documentSpaceService, 'createNewFolder').mockReturnValue(Promise.resolve());

      spacesService.submitElementName('new name');

      await waitFor(() => expect(createFolderSpy).toHaveBeenCalled());

      expect(spacesState.createEditElementOpType.value).toEqual(CreateEditOperationType.NONE);
      expect(spacesState.isSubmitting.value).toEqual(false);
      expect(spacesState.showErrorMessage.value).toEqual(false);
      expect(spacesState.shouldUpdateDatasource.value).toEqual(true);

      expect(createTextToastMock).toHaveBeenCalledWith(ToastType.SUCCESS, 'Folder created');
    });

    it('should handle unsuccessful folder creation', async () => {
      const createFolderSpy = jest.spyOn(documentSpaceService, 'createNewFolder').mockReturnValue(Promise.reject(Error('failure')));

      const setStateOnExceptionSpy = jest.spyOn(spacesService, 'setPageStateOnException');

      spacesService.submitElementName('new name');

      await waitFor(() => expect(createFolderSpy).toHaveBeenCalled());
      await waitFor(() => expect(setStateOnExceptionSpy).toHaveBeenCalled());
    });
  });

  describe('folder edit tests', () => {
    beforeEach(() => {
      spacesState.selectedSpace.set(documentSpaces[0]);
      spacesState.selectedFile.set(documents[0]);
      spacesState.createEditElementOpType.set(CreateEditOperationType.EDIT_FOLDERNAME);
    });

    afterEach(() => {
      spacesService.resetState();
    });

    it('should handle successful folder renames', async () => {
      const renameFolderSpy = jest.spyOn(documentSpaceService, 'renameFolder').mockReturnValue(Promise.resolve());

      spacesService.submitElementName('new name');

      await waitFor(() => expect(renameFolderSpy).toHaveBeenCalled());

      expect(spacesState.createEditElementOpType.value).toEqual(CreateEditOperationType.NONE);
      expect(spacesState.isSubmitting.value).toEqual(false);
      expect(spacesState.showErrorMessage.value).toEqual(false);
      expect(spacesState.shouldUpdateDatasource.value).toEqual(true);
      expect(spacesState.selectedFile.value).toEqual(undefined);

      expect(createTextToastMock).toHaveBeenCalledWith(ToastType.SUCCESS, 'Folder renamed');
    });

    it('should handle unsuccessful folder renames', async () => {
      const renameFolderSpy = jest.spyOn(documentSpaceService, 'renameFolder').mockReturnValue(Promise.reject(Error('failure')));
      const setStateOnExceptionSpy = jest.spyOn(spacesService, 'setPageStateOnException');

      spacesService.submitElementName('new name');

      await waitFor(() => expect(renameFolderSpy).toHaveBeenCalled());
      await waitFor(() => expect(setStateOnExceptionSpy).toHaveBeenCalled());
    });

    it('should throw when state invalid (selected file in state not set)', () => {
      spacesState.selectedFile.set(undefined);

      expect(() => spacesService.submitElementName('new name')).toThrowError('Folder document cannot be null for rename');
    });
  });

  describe('add to favorite tests', () => {
    beforeEach(() => {
      spacesState.selectedSpace.set(documentSpaces[0]);
    });

    afterEach(() => {
      spacesService.resetState();
    });

    it('should handle successful addition', async () => {
      const addFavoriteSpy = jest.spyOn(documentSpaceService, 'addPathEntityToFavorites').mockReturnValue(Promise.resolve());

      expect(spacesState.favorites.value.length).toEqual(0);

      const docToAdd = documents[0];

      spacesService.addToFavorites(docToAdd);
      await waitFor(() => expect(addFavoriteSpy).toHaveBeenCalled());

      expect(spacesState.shouldUpdateDatasource.value).toEqual(true);

      expect(createTextToastMock).toHaveBeenCalledWith(ToastType.SUCCESS, 'Successfully added to favorites');

      const updatedFavoritesState = spacesState.favorites.value;
      expect(updatedFavoritesState.some(item => item.key === docToAdd.key)).toEqual(true);
    });

    it('should do nothing when no space selected', () => {
      spacesState.selectedSpace.set(undefined);
      const currentStateValue = spacesState.value;

      spacesService.addToFavorites(documents[0]);

      expect(currentStateValue).toEqual(spacesState.value);

      expect(createTextToastMock).toHaveBeenCalledWith(ToastType.ERROR, 'Could not add to favorites');
    });
  });

  describe('remove from favorite tests', () => {
    beforeEach(() => {
      spacesState.selectedSpace.set(documentSpaces[0]);
      spacesState.favorites.set(favorites);
    });

    afterEach(() => {
      spacesService.resetState();
    });

    it('should handle successful removal', async () => {
      const removeFavoriteSpy = jest.spyOn(documentSpaceService, 'removePathEntityFromFavorites').mockReturnValue(Promise.resolve());

      const docToRemove = documents[0];

      expect(spacesState.favorites.value.some(item => item.key === docToRemove.key)).toEqual(true);

      spacesService.removeFromFavorites(docToRemove);
      await waitFor(() => expect(removeFavoriteSpy).toHaveBeenCalled());

      expect(createTextToastMock).toHaveBeenCalledWith(ToastType.SUCCESS, 'Successfully removed from favorites');

      expect(spacesState.shouldUpdateDatasource.value).toEqual(true);
      expect(spacesState.favorites.value.some(item => item.key === docToRemove.key)).toEqual(false);
    });

    it('should do nothing if no space selected in state', () => {
      spacesState.selectedSpace.set(undefined);
      const currentStateValue = spacesState.value;

      spacesService.removeFromFavorites(documents[0]);

      expect(currentStateValue).toEqual(spacesState.value);

      expect(createTextToastMock).toHaveBeenCalledWith(ToastType.ERROR, 'Could not remove from favorites');
    });

  });

  it('should determine if should show favorite', () => {
    spacesState.favorites.set(favorites);

    expect(spacesService.getFavoritesShouldShow(documents[0], true)).toEqual(false);
    expect(spacesService.getFavoritesShouldShow(documents[0], false)).toEqual(true);

    expect(spacesService.getFavoritesShouldShow(documents[1], true)).toEqual(true);
    expect(spacesService.getFavoritesShouldShow(documents[1], false)).toEqual(false);
  });

  describe('archive file tests', () => {
    let closeDialogsSpy: jest.SpyInstance<void, []>;

    beforeEach(() => {
      spacesState.selectedSpace.set(documentSpaces[0]);

      closeDialogsSpy = jest.spyOn(spacesService, 'closeRemoveDialog');
    });

    afterEach(() => {
      spacesService.resetState();
    });

    it('should do nothing if no space is selected', () => {
      const archiveItemsSpy = jest.spyOn(documentSpaceService, 'archiveItems').mockReturnValue(Promise.resolve());

      spacesState.selectedSpace.set(undefined);
      spacesState.selectedFiles.set(documents);
      spacesService.archiveFile();

      expect(archiveItemsSpy).not.toHaveBeenCalled();
      expect(spacesState.selectedFiles.value).toEqual(documents);
    });

    it('should handle successful multiselect archive', async () => {
      const archiveItemsSpy = jest.spyOn(documentSpaceService, 'archiveItems').mockReturnValue(Promise.resolve());

      spacesState.selectedFiles.set(documents);
      spacesService.archiveFile(false);

      await waitFor(() => expect(archiveItemsSpy).toHaveBeenCalled());

      expect(spacesState.shouldUpdateDatasource.value).toEqual(true);
      expect(spacesState.datasource.value).toBeDefined();
      expect(spacesState.selectedFile.value).not.toBeDefined();
      expect(spacesState.selectedFiles.value).toEqual([]);
      expect(closeDialogsSpy).toHaveBeenCalled();

      expect(createTextToastMock).toHaveBeenCalledWith(ToastType.SUCCESS, 'Item(s) Archived');
    });

    it('should handle unsuccessful multiselect archive', async () => {
      const archiveItemsSpy = jest.spyOn(documentSpaceService, 'archiveItems').mockReturnValue(Promise.reject(Error('failure')));

      spacesState.selectedFiles.set(documents);
      spacesService.archiveFile(false);

      await waitFor(() => expect(archiveItemsSpy).toHaveBeenCalled());

      expect(spacesState.shouldUpdateDatasource.value).toEqual(true);
      expect(spacesState.datasource.value).toBeDefined();
      expect(spacesState.selectedFile.value).not.toBeDefined();
      expect(spacesState.selectedFiles.value).toEqual([]);
      expect(closeDialogsSpy).toHaveBeenCalled();

      expect(createTextToastMock).toHaveBeenCalledWith(ToastType.ERROR, 'Could not archive item(s) - failure');
    });

    it('should handle successful single archive', async () => {
      const archiveItemsSpy = jest.spyOn(documentSpaceService, 'archiveItems').mockReturnValue(Promise.resolve());

      const selectedDocuments = [...documents];
      const itemToBeArchived = selectedDocuments[0];

      spacesState.selectedFiles.set(selectedDocuments);
      spacesState.selectedFile.set(itemToBeArchived);
      spacesService.archiveFile(true);

      await waitFor(() => expect(archiveItemsSpy).toHaveBeenCalled());

      expect(spacesState.shouldUpdateDatasource.value).toEqual(true);
      expect(spacesState.datasource.value).toBeDefined();
      expect(spacesState.selectedFile.value).not.toBeDefined();
      expect(spacesState.selectedFiles.value).toEqual([]);

      expect(closeDialogsSpy).toHaveBeenCalled();
    });

    it('should handle unsuccessful single archive', async () => {
      const archiveItemsSpy = jest.spyOn(documentSpaceService, 'archiveItems').mockReturnValue(Promise.reject(Error('failure')));

      const itemToBeArchived = documents[0];

      spacesState.selectedFiles.set(documents);
      spacesState.selectedFile.set(itemToBeArchived);
      spacesService.archiveFile(true);

      await waitFor(() => expect(archiveItemsSpy).toHaveBeenCalled());

      expect(spacesState.shouldUpdateDatasource.value).toEqual(true);
      expect(spacesState.datasource.value).toBeDefined();
      expect(spacesState.selectedFile.value).not.toBeDefined();
      expect(spacesState.selectedFiles.value).toEqual([]);

      expect(closeDialogsSpy).toHaveBeenCalled();
    });

    it('should throw on single archive when state is invalid (no file selected in state)', async () => {
      spacesState.selectedFile.set(undefined);
      await expect(spacesService.archiveFile(true)).rejects.toEqual(Error('Selected file cannot be null for archive'));
    });
  });

  it('should handle merging state depending on component mounted status', () => {
    // Should update state
    mountedRef.current = true;
    expect(spacesState.drawerOpen.value).toEqual(false);
    expect(spacesState.isSubmitting.value).toEqual(false);
    spacesService.mergeState({ drawerOpen: true, isSubmitting: true });
    expect(spacesState.drawerOpen.value).toEqual(true);
    expect(spacesState.isSubmitting.value).toEqual(true);

    // Should not update state
    mountedRef.current = false;
    spacesService.mergeState({ drawerOpen: false, isSubmitting: false });
    expect(spacesState.drawerOpen.value).toEqual(true);
    expect(spacesState.isSubmitting.value).toEqual(true);
  });

  it('should set state to close Add New Space sidedrawer', () => {
    spacesState.drawerOpen.set(true);
    expect(spacesState.drawerOpen.value).toEqual(true);

    spacesService.closeDrawer();
    expect(spacesState.drawerOpen.value).toEqual(false);
  });

  it('should set state to close settings sidedrawer', () => {
    spacesState.isDefaultDocumentSpaceSettingsOpen.set(true);
    expect(spacesState.isDefaultDocumentSpaceSettingsOpen.value).toEqual(true);

    spacesService.closeMySettingsDrawer();
    expect(spacesState.isDefaultDocumentSpaceSettingsOpen.value).toEqual(false);
  });

  it('should set state to hide error message', () => {
    spacesState.showErrorMessage.set(true);
    expect(spacesState.showErrorMessage.value).toEqual(true);

    spacesService.closeErrorMsg();
    expect(spacesState.showErrorMessage.value).toEqual(false);
  });

  it('should set state for all Delete dialogs to closed', () => {
    spacesState.showDeleteDialog.set(true);
    spacesState.showDeleteSelectedDialog.set(true);
    expect(spacesState.showDeleteDialog.value).toEqual(true);
    expect(spacesState.showDeleteSelectedDialog.value).toEqual(true);

    spacesService.closeRemoveDialog();

    expect(spacesState.showDeleteDialog.value).toEqual(false);
    expect(spacesState.showDeleteSelectedDialog.value).toEqual(false);
  });

  it('should reset datasource update state on callback', () => {
    spacesState.shouldUpdateDatasource.set(true);
    expect(spacesState.shouldUpdateDatasource.value).toEqual(true);

    spacesService.onDatasourceUpdateCallback();
    expect(spacesState.shouldUpdateDatasource.value).toEqual(false);
  });

  it('should set state correctly on exception', () => {
    spacesService.setPageStateOnException('test failure');

    expect(spacesState.isSubmitting.value).toEqual(false);
    expect(spacesState.errorMessage.value).toEqual('test failure');
    expect(spacesState.showErrorMessage.value).toEqual(true);
  });

  it('should reset state', () => {
    spacesState.set({
      drawerOpen: true,
      isSubmitting: true,
      showErrorMessage: true,
      errorMessage: 'some msg',
      selectedSpace: undefined,
      shouldUpdateDatasource: true,
      datasource: undefined,
      showUploadDialog: true,
      showDeleteDialog: true,
      fileToDelete: '',
      selectedFile: undefined,
      selectedFiles: [],
      membershipsState: {
        isOpen: true
      },
      createEditElementOpType: CreateEditOperationType.NONE,
      path: '',
      showDeleteSelectedDialog: true,
      isDefaultDocumentSpaceSettingsOpen: true,
      sideDrawerSize: SideDrawerSize.WIDE,
      favorites: []
    });

    const documentSpaceServiceResetSpy = jest.spyOn(documentSpaceService, 'resetState');
    const documentSpacePrivilegeServiceResetSpy = jest.spyOn(documentSpacePrivilegeService, 'resetState');

    spacesService.resetState();

    expect(documentSpaceServiceResetSpy).toHaveBeenCalled();
    expect(documentSpacePrivilegeServiceResetSpy).toHaveBeenCalled();
    expect(spacesState.value).toEqual({
      drawerOpen: false,
      isSubmitting: false,
      showErrorMessage: false,
      errorMessage: '',
      selectedSpace: undefined,
      shouldUpdateDatasource: false,
      datasource: undefined,
      showUploadDialog: false,
      showDeleteDialog: false,
      fileToDelete: '',
      selectedFile: undefined,
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
  });
});
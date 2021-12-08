import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { MutableRefObject } from 'react';
import { InfiniteScrollOptions } from '../../../../components/DataCrudFormPage/infinite-scroll-options';
import { SideDrawerSize } from '../../../../components/SideDrawer/side-drawer-size';
import { DashboardUserControllerApi, DashboardUserDto, DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceResponseDto, DocumentSpacePrivilegeDtoTypeEnum, DocumentDto } from '../../../../openapi';
import AuthorizedUserService from '../../../../state/authorized-user/authorized-user-service';
import DocumentSpacePrivilegeService from '../../../../state/document-space/document-space-privilege-service';
import DocumentSpaceService from '../../../../state/document-space/document-space-service';
import DocumentSpaceGlobalService, { DocumentSpaceGlobalState } from '../../document-space-global-service';
import { CreateEditOperationType } from '../../document-space-utils';
import SpacesPageService from '../spaces-page-service';
import { SpacesPageState } from '../spaces-page-state';

describe('Spaces Page Service Test', () => {
  const infiniteScrollOptions: InfiniteScrollOptions = {
    enabled: true,
    limit: 100,
  };

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
  });

  it('should remove an existing DocumentDto in place', () => {
    const documentsToTest = [...documents];

    expect(documentsToTest.length).toEqual(documents.length);
    spacesService.spliceExistingDocument(documentsToTest, documents[0]);
    expect(documentsToTest.length).toEqual(documents.length - 1);
    expect(documentsToTest).not.toContainEqual(documents[0]);
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
import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { IGetRowsParams } from 'ag-grid-community';
import { AxiosResponse } from 'axios';
import { MutableRefObject } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SideDrawerSize } from '../../../../components/SideDrawer/side-drawer-size';
import {
  DashboardUserControllerApi,
  DashboardUserDto,
  DocumentMobileDto,
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceResponseDto,
  DocumentSpaceResponseDtoResponseWrapper
} from '../../../../openapi';
import AuthorizedUserService from '../../../../state/authorized-user/authorized-user-service';
import { useAuthorizedUserState } from '../../../../state/authorized-user/authorized-user-state';
import DocumentSpaceDownloadUrlService from '../../../../state/document-space/document-space-download-url-service';
import DocumentSpaceGlobalService, {
  DocumentSpaceGlobalState
} from '../../../../state/document-space/document-space-global-service';
import DocumentSpacePrivilegeService from '../../../../state/document-space/document-space-privilege-service';
import DocumentSpaceService from '../../../../state/document-space/document-space-service';
import {
  ClipBoardState,
  documentSpaceDownloadUrlService,
  documentSpaceMembershipService,
  useDocumentSpaceGlobalState,
  useDocumentSpaceMembershipsPageState,
  useDocumentSpacePageState,
  useDocumentSpacePrivilegesState,
  useDocumentSpaceState
} from '../../../../state/document-space/document-space-state';
import DocumentSpaceMembershipsPageService from '../../../../state/document-space/memberships-page/memberships-page-service';
import { DocumentSpaceMembershipsState, BatchUploadState } from '../../../../state/document-space/memberships-page/memberships-page-state';
import DocumentSpaceMembershipService from '../../../../state/document-space/memberships/document-space-membership-service';
import SpacesPageService from '../../../../state/document-space/spaces-page/spaces-page-service';
import { SpacesPageState } from '../../../../state/document-space/spaces-page/spaces-page-state';
import { CancellableDataRequest } from '../../../../utils/cancellable-data-request';
import { CreateEditOperationType } from '../../../../utils/document-space-utils';
import {
  createAxiosSuccessResponse
} from '../../../../utils/TestUtils/test-utils';
import DocumentSpacePage from '../../DocumentSpacePage';

jest.mock('../../../../state/document-space/document-space-state');
jest.mock('../../../../state/authorized-user/authorized-user-state');

describe('Search Space Tests', () => {
  const documentSpaces: DocumentSpaceResponseDto[] = [
    {
      id: '412ea028-1fc5-41e0-b48a-c6ef090704d3',
      name: 'space1',
    },
    {
      id: '52909027-69f6-4d0c-83da-293bc2d9d2f8',
      name: 'space2',
    },
  ];

  const getSpacesResponse: AxiosResponse<DocumentSpaceResponseDtoResponseWrapper> = createAxiosSuccessResponse({
    data: documentSpaces,
  });

  let documentSpacesState: State<DocumentSpaceResponseDto[]> & StateMethodsDestroy;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;

  let documentSpacePrivilegeState: State<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>;
  let documentSpacePrivilegeService: DocumentSpacePrivilegeService;

  let membershipService: DocumentSpaceMembershipService;
  let membershipPageState: State<DocumentSpaceMembershipsState> & StateMethodsDestroy;
  let uploadState: State<BatchUploadState> & StateMethodsDestroy;

  let globalDocumentSpaceState: State<DocumentSpaceGlobalState>;
  let globalDocumentSpaceService: DocumentSpaceGlobalService;

  let mountedRef: MutableRefObject<boolean>;
  let documentSpacePageState: State<SpacesPageState>;
  let documentSpacePageService: SpacesPageService;

  let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy;
  let dashboardUserApi: DashboardUserControllerApi;
  let authorizedUserService: AuthorizedUserService;

  let clipboardStateLocal = createState<ClipBoardState | undefined>({
    items: ['items.txt'],
    isCopy: true,
    sourceSpace: 'sdf',
  });

  beforeEach(() => {
    authorizedUserState = createState<DashboardUserDto | undefined>(undefined);
    dashboardUserApi = new DashboardUserControllerApi();
    authorizedUserService = new AuthorizedUserService(authorizedUserState, dashboardUserApi);

    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);

    documentSpacePrivilegeState = createState<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>({});
    documentSpacePrivilegeService = new DocumentSpacePrivilegeService(documentSpaceApi, documentSpacePrivilegeState);

    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);

    globalDocumentSpaceState = createState<DocumentSpaceGlobalState>({
      currentDocumentSpace: undefined,
    });
    globalDocumentSpaceService = new DocumentSpaceGlobalService(globalDocumentSpaceState);

    mountedRef = {
      current: true,
    };
    documentSpacePageState = createState<SpacesPageState>({
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
      showNoChosenSpace: false, // state we get into if we nav to an non-exist or private space
      showFolderSizeDialog: false,
      selectedItemForSize: undefined,
      searchQuery: undefined,
    });

    documentSpacePageService = new SpacesPageService(
      documentSpacePageState,
      mountedRef,
      authorizedUserService,
      globalDocumentSpaceService,
      documentSpaceService,
      documentSpacePrivilegeService,
      clipboardStateLocal
    );

    membershipPageState = createState<DocumentSpaceMembershipsState>({
      datasourceState: {
        datasource: undefined,
        shouldUpdateDatasource: true,
      },
      membersState: {
        selected: [],
        deletionState: {
          isConfirmationOpen: false,
        },
        membersToUpdate: [],
        submitting: false,
        memberUpdateSuccessMessage: '',
        memberUpdateFailMessage: '',
        showUpdateFailMessage: false,
        showUpdateSuccessMessage: true,
      },
      appClientsDatasourceState: {
        datasource: undefined,
        shouldUpdateDatasource: true,
      },
      appClientMembersState: {
        selected: [],
        deletionState: {
          isConfirmationOpen: false,
        },
        membersToUpdate: [],
        submitting: false,
        memberUpdateSuccessMessage: '',
        memberUpdateFailMessage: '',
        showUpdateFailMessage: false,
        showUpdateSuccessMessage: false,
      },
      selectedTab: 0,
    });

    uploadState = createState<BatchUploadState>({
      successErrorState: {
        successMessage: 'Successfully added members to Document Space',
        errorMessage: '',
        showSuccessMessage: false,
        showErrorMessage: false,
        showCloseButton: true,
      }
    });

    (useAuthorizedUserState as jest.Mock).mockReturnValue(authorizedUserService);
    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
    (useDocumentSpacePrivilegesState as jest.Mock).mockReturnValue(documentSpacePrivilegeService);
    (useDocumentSpaceGlobalState as jest.Mock).mockReturnValue(globalDocumentSpaceService);
    (useDocumentSpacePageState as jest.Mock).mockReturnValue(documentSpacePageService);
    (documentSpaceDownloadUrlService as jest.Mock).mockReturnValue(new DocumentSpaceDownloadUrlService());
    (useDocumentSpaceMembershipsPageState as jest.Mock)
      .mockReturnValue(new DocumentSpaceMembershipsPageService(membershipPageState, uploadState, membershipService));
      
    setupDefaultMocks();
  });

  let fetchSpacesSpy: jest.SpyInstance<CancellableDataRequest<DocumentSpaceResponseDto[]>, []>;
  function setupDefaultMocks() {
    fetchSpacesSpy = jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces');
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
    jest.spyOn(membershipService, 'getAvailableAppClientsForDocumentSpace').mockReturnValue(Promise.resolve([]));
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction').mockReturnValue(true);
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render searched items', async () => {
    let retVal = [{
      spaceId: 'sdfdsf',
      key: 'testFile',
      parentId: 'parentId',
      path: '',
      size: 0,
      lastModifiedBy: 'homer',
      lastModifiedDate: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      hasContents: false,
      folder: false,
    },{
      spaceId: 'sdfdsf',
      key: 'testFolder',
      parentId: 'parentId',
      path: '',
      size: 0,
      lastModifiedBy: 'homer',
      lastModifiedDate: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      hasContents: true,
      folder: true,
    },
    {
      spaceId: 'sdfdsf',
      key: 'testEmptyFolder',
      parentId: 'parentId',
      path: '',
      size: 0,
      lastModifiedBy: 'homer',
      lastModifiedDate: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      hasContents: false,
      folder: true,
    }] as DocumentMobileDto[];

    const dataMock = jest.spyOn(documentSpaceService, 'createSearchDatasource').mockReturnValue(
      { getRows: async (params: IGetRowsParams) => { params.successCallback(retVal, 3); } }
    );

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    // click on the search tab
    await waitFor(() => expect(page.getByText('Search')).toBeVisible);
    fireEvent.click(page.getByText('Search'));

    // check that the search button is disabled
    await waitFor(() => expect(page.getByTestId('search-space-button')).toBeDisabled);

    await waitFor(() => expect(page.container.querySelector(".ag-root-wrapper")).toBeInTheDocument());
    await waitFor(() => expect(page.container.querySelector(".ag-overlay-no-rows-center")).toBeNull());

    // add text - check for button to not be disabled
    await waitFor(() => expect(page.getByTestId('search-space-field')));
    fireEvent.change(page.getByTestId('search-space-field'), { target: { value: 'test' }});

    // check button is not disabled
    await waitFor(() => expect(page.getByTestId('search-space-button')).not.toBeDisabled);

    // see that our search results populate in the grid
    fireEvent.click(page.getByTestId('search-space-button'));
    await waitFor(() => expect(dataMock).toHaveBeenCalled());    
    await waitFor(() => expect(page.getByText('testFile')).toBeVisible);

    // check search state is preserved switching away from the search tab
    await waitFor(() => expect(page.getByText('Browse')).toBeVisible);
    fireEvent.click(page.getByText('Browse'));

    // come back to search tab
    await waitFor(() => expect(page.getByText('Search')).toBeVisible);
    fireEvent.click(page.getByText('Search'));

    // check search query still there
    await waitFor(() => expect(page.getByTestId('search-space-field')).toHaveDisplayValue('test'));

    await waitFor(() => expect(page.container.querySelector(".ag-root-wrapper")).toBeInTheDocument());
    await waitFor(() => expect(page.container.querySelector(".ag-overlay-no-rows-center")).toBeNull());

    // test that we can interact with the search results
    // click on the testFolder - should nav to the Browse tab in that path
    await waitFor(() => expect(page.getByText(/testFolder/)).toBeVisible);
    fireEvent.click(page.getByText(/testFolder/));

    // test we're in the Browse files tab
    await waitFor(() => expect(page.getByText('My Folders')).toBeVisible);  

  });
});

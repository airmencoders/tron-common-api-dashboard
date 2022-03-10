import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IGetRowsParams } from 'ag-grid-community';
import { AxiosPromise, AxiosResponse } from 'axios';
import { MutableRefObject } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SideDrawerSize } from '../../../../components/SideDrawer/side-drawer-size';
import {
  DashboardUserControllerApi,
  DashboardUserDto,
  DocumentDto,
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceResponseDto,
  DocumentSpaceResponseDtoResponseWrapper,
  RecentDocumentDto,
  S3PaginationDto
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
  useDocumentSpacePageState,
  useDocumentSpacePrivilegesState,
  useDocumentSpaceState
} from '../../../../state/document-space/document-space-state';
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

    (useAuthorizedUserState as jest.Mock).mockReturnValue(authorizedUserService);
    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
    (useDocumentSpacePrivilegesState as jest.Mock).mockReturnValue(documentSpacePrivilegeService);
    (useDocumentSpaceGlobalState as jest.Mock).mockReturnValue(globalDocumentSpaceService);
    (useDocumentSpacePageState as jest.Mock).mockReturnValue(documentSpacePageService);
    (documentSpaceDownloadUrlService as jest.Mock).mockReturnValue(new DocumentSpaceDownloadUrlService());
    setupDefaultMocks();
  });

  let fetchSpacesSpy: jest.SpyInstance<CancellableDataRequest<DocumentSpaceResponseDto[]>, []>;
  function setupDefaultMocks() {
    fetchSpacesSpy = jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces');
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction').mockReturnValue(true);
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });


  it('should render the current paths folders and files', async () => {
    let retVal = [
        {
          spaceId: 'sdfdsf',
          key: 'testFile',
          path: '',
          size: 0,
          lastModifiedBy: 'homer',
          lastModifiedDate: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          hasContents: false,
          folder: false,
        },
        {
          spaceId: 'sdfdsf',
          key: 'folder1',
          path: '',
          size: 0,
          lastModifiedBy: 'homer',
          lastModifiedDate: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          hasContents: false,
          folder: true,
        },
      ] as DocumentDto[];

    jest
      .spyOn(documentSpaceService, 'createDatasource')
      .mockReturnValue(
        { rowCount: 2, getRows: async (params: IGetRowsParams) => { params.successCallback(retVal, 2); } }
      );

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    // do some space toggling to make sure a document space is selected
    const documentSpacesSelect = page.getByTestId('document-space-selector');
    expect(documentSpacesSelect).toBeEnabled();
    await waitFor(() => expect(documentSpacesSelect.textContent).toContain(documentSpaces[0].name));    
    act(() => { userEvent.click(documentSpacesSelect); });
    await waitFor(() => expect(page.getByTestId(documentSpaces[1].name)));
    const item2 = page.getByTestId(documentSpaces[1].name);
    act(() => { userEvent.click(item2); })
    await waitFor(() => expect(item2.textContent).toContain(documentSpaces[1].name));

    // click on the search tab
    await waitFor(() => expect(page.getByText('Browse')).toBeVisible);
    fireEvent.click(page.getByText('Browse'));

    // see that our contents render
    await waitFor(() => expect(page.getByText('testFile')).toBeVisible);

    // click the item to exercise the handler
    fireEvent.click(page.getByText('folder1'));
    await waitFor(() => expect(window.history).toHaveLength(1));
  });
});

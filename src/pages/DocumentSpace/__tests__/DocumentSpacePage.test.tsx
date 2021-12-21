import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import { MemoryRouter, Route } from 'react-router-dom';
import { ToastContainer } from '../../../components/Toast/ToastContainer/ToastContainer';
import {
  DashboardUserControllerApi,
  DashboardUserDto,
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceResponseDto,
  DocumentSpaceResponseDtoResponseWrapper
} from '../../../openapi';
import AuthorizedUserService from '../../../state/authorized-user/authorized-user-service';
import { useAuthorizedUserState } from '../../../state/authorized-user/authorized-user-state';
import DocumentSpaceGlobalService, { DocumentSpaceGlobalState } from '../../../state/document-space/document-space-global-service';
import DocumentSpaceMembershipService from '../../../state/document-space/memberships/document-space-membership-service';
import DocumentSpacePrivilegeService from '../../../state/document-space/document-space-privilege-service';
import DocumentSpaceService from '../../../state/document-space/document-space-service';
import { documentSpaceMembershipService, useDocumentSpaceGlobalState, useDocumentSpacePageState, useDocumentSpacePrivilegesState, useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import { createAxiosSuccessResponse, createGenericAxiosRequestErrorResponse } from '../../../utils/TestUtils/test-utils';
import DocumentSpacePage from '../DocumentSpacePage';
import SpacesPageService from '../../../state/document-space/spaces-page/spaces-page-service';
import { SpacesPageState } from '../../../state/document-space/spaces-page/spaces-page-state';
import { MutableRefObject } from 'react';
import { CreateEditOperationType } from '../../../state/document-space/document-space-utils';
import { SideDrawerSize } from '../../../components/SideDrawer/side-drawer-size';
import { CancellableDataRequest } from '../../../utils/cancellable-data-request';

jest.mock('../../../state/document-space/document-space-state');
jest.mock('../../../state/authorized-user/authorized-user-state');

describe('Test Document Space Page', () => {
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

  const getSpacesResponse: AxiosResponse<DocumentSpaceResponseDtoResponseWrapper> = createAxiosSuccessResponse({ data: documentSpaces });

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

  beforeEach(() => {
    authorizedUserState = createState<DashboardUserDto | undefined>(undefined);
    dashboardUserApi = new DashboardUserControllerApi();
    authorizedUserService = new AuthorizedUserService(authorizedUserState, dashboardUserApi);

    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);

    documentSpacePrivilegeState = createState<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>({});
    documentSpacePrivilegeService = new DocumentSpacePrivilegeService(
      documentSpaceApi,
      documentSpacePrivilegeState
    );

    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);

    globalDocumentSpaceState = createState<DocumentSpaceGlobalState>({
      currentDocumentSpace: undefined
    });
    globalDocumentSpaceService = new DocumentSpaceGlobalService(globalDocumentSpaceState);

    mountedRef = {
      current: true
    };
    documentSpacePageState = createState<SpacesPageState>({
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
      favorites: [],
      spaceNotFound: false
    });

    documentSpacePageService = new SpacesPageService(
      documentSpacePageState,
      mountedRef,
      authorizedUserService,
      globalDocumentSpaceService,
      documentSpaceService,
      documentSpacePrivilegeService
    );

    (useAuthorizedUserState as jest.Mock).mockReturnValue(authorizedUserService);
    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
    (useDocumentSpacePrivilegesState as jest.Mock).mockReturnValue(documentSpacePrivilegeService);
    (useDocumentSpaceGlobalState as jest.Mock).mockReturnValue(globalDocumentSpaceService);
    (useDocumentSpacePageState as jest.Mock).mockReturnValue(documentSpacePageService);

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

  it('should show loading select when first retrieving Document Spaces', async () => {
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(true);

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    await waitFor(() => expect(page.getByLabelText('Spaces')).toBeInTheDocument());
    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeDisabled();
    expect(documentSpacesSelect).toHaveValue('loading');

  });

  it('should show error select when retrieving Document Spaces fails', async () => {
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(true);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchSpacesSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(page.getByLabelText('Spaces')).toBeInTheDocument());
    
    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeDisabled();
    expect(documentSpacesSelect).toHaveValue('error');
  });

  it('should show Document Spaces options select with first item in state when state is not promised or errored', async () => {
    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchSpacesSpy).toHaveBeenCalled());
    await waitFor(() => expect(page.findByLabelText('Spaces')).resolves.toBeInTheDocument());
    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeEnabled();
    expect(documentSpacesSelect).toHaveValue(documentSpaces[0].id);
  });

  it('should show DocumentSpaceMySettingButton when the user has at least one document space', async () => {
    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchSpacesSpy).toHaveBeenCalled());
    const documentSpacesSelect = page.getByTestId('doc-space-my-settings__btn');
    expect(documentSpacesSelect).toBeInTheDocument()
  });

  it('should not show Upload Files button while spaces are loading (no space selected)', () => {
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(true);

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    expect(page.queryByTitle("Upload Files")).not.toBeInTheDocument();
  });

  it('should allow to change space', async () => {
    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchSpacesSpy).toHaveBeenCalled());

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeEnabled();
    expect(documentSpacesSelect).toHaveValue(documentSpaces[0].id);

    userEvent.selectOptions(documentSpacesSelect, documentSpaces[1].id);
    await waitFor(() => expect(documentSpacesSelect).toHaveValue(documentSpaces[1].id));
  });

  it('should open/close Document Space Memberships side drawer', async () => {
    const getPrivilegesSpy = jest.spyOn(documentSpacePrivilegeService, 'fetchAndStoreDashboardUserDocumentSpacePrivileges').mockReturnValue({
      promise: Promise.resolve({
        'id': {
          READ: false,
          WRITE: false,
          MEMBERSHIP: true
        }
      }),
      cancelTokenSource: axios.CancelToken.source()
    });    

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchSpacesSpy).toHaveBeenCalled());
    
    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeEnabled();
    userEvent.selectOptions(documentSpacesSelect, documentSpaces[1].id);

    await waitFor(() => expect(getPrivilegesSpy).toHaveBeenCalled());

    await waitFor(()=>expect(page.getByTitle('Manage Users')).toBeInTheDocument())

    const membersButton = page.getByTitle('Manage Users');
    expect(membersButton).toBeInTheDocument();

    // Open the panel
    userEvent.click(membersButton);
    await waitFor(() => expect(page.getByText('Add Member')).toBeVisible());

    // close the panel
    const closeButton = page.getByText('Close');
    expect(closeButton).toBeInTheDocument();
    userEvent.click(closeButton);
  });

  describe('Test error behaviors for document space privilege retrieval', () => {
    it('should show error toast when failed to retrieve document space privileges', async () => {
      jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);
      fetchSpacesSpy = jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
        promise: Promise.resolve(documentSpaces),
        cancelTokenSource: axios.CancelToken.source()
      });
      jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(false);
      const getPrivilegesSpy = jest.spyOn(documentSpaceApi, 'getSelfDashboardUserPrivilegesForDocumentSpace')
        .mockReturnValue(new Promise((resolve, reject) => setTimeout(() => reject(createGenericAxiosRequestErrorResponse(404)), 10)));
  
      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
          />
        </MemoryRouter>
      );
  
      await waitFor(() => expect(fetchSpacesSpy).toHaveBeenCalled());
      await waitFor(() => expect(getPrivilegesSpy).toHaveBeenCalled());
      const toasts = await page.findAllByText('Could not load privileges for the selected Document Space');
      expect(toasts.length).toBeGreaterThanOrEqual(1);
  
      // No actions should be available, and no grid
      expect(page.queryByText('Add New Space')).not.toBeInTheDocument();
      expect(page.queryByTitle('Download Items')).not.toBeInTheDocument();
      expect(page.queryByTitle('Add Items')).not.toBeInTheDocument();
      expect(page.queryByTitle('Upload Files')).not.toBeInTheDocument();
      expect(page.queryByTitle('Manager Users')).not.toBeInTheDocument();
      // find by a column header in grid
      expect(page.queryByText('Name')).not.toBeInTheDocument();
    });
  
    it('should show error toast when not authorized to a space', async () => {
      jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);
      fetchSpacesSpy = jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
        promise: Promise.resolve(documentSpaces),
        cancelTokenSource: axios.CancelToken.source()
      });
      jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(false);
      const getPrivilegesSpy = jest.spyOn(documentSpaceApi, 'getSelfDashboardUserPrivilegesForDocumentSpace')
        .mockReturnValue(new Promise((resolve, reject) => setTimeout(() => reject(createGenericAxiosRequestErrorResponse(403)), 10)));
  
      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
          />
        </MemoryRouter>
      );
  
      await waitFor(() => expect(fetchSpacesSpy).toHaveBeenCalled());
      await waitFor(() => expect(getPrivilegesSpy).toHaveBeenCalled());
      const toasts = await page.findAllByText('Not authorized for the selected Document Space');
      expect(toasts.length).toBeGreaterThanOrEqual(1);
  
      // No actions should be available, and no grid
      expect(page.queryByText('Add New Space')).not.toBeInTheDocument();
      expect(page.queryByTitle('Download Items')).not.toBeInTheDocument();
      expect(page.queryByTitle('Add Items')).not.toBeInTheDocument();
      expect(page.queryByTitle('Upload Files')).not.toBeInTheDocument();
      expect(page.queryByTitle('Manager Users')).not.toBeInTheDocument();
      // find by a column header in grid
      expect(page.queryByText('Name')).not.toBeInTheDocument();
    });
  });
  
  describe('Test conditional actions based on document space privilege', () => {
    it('should show Add New Space button with DASHBOARD_ADMIN privilege', () => {
      jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(true);

      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
        </MemoryRouter>
      );

      const addBtn = page.getByText('Add New Space');
      expect(addBtn).toBeVisible();
    });

    it('should not show Add New Space button when missing DASHBOARD_ADMIN privilege', () => {
      jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(false);

      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
        </MemoryRouter>
      );

      const addBtn = page.queryByText('Add New Space');
      expect(addBtn).not.toBeInTheDocument();
    });
  });

  it('should update the url when navigating to another space', async () => {
    let testHistory: any;
    let testLocation: any;
    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
        <Route
          path="*"
          render={({ history, location }) => {
            testHistory = history;
            testLocation = location;
            return null;
          }}
        />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchSpacesSpy).toHaveBeenCalled());

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeEnabled();
    await waitFor(() => expect(page.queryAllByText(documentSpaces[0].name)).toBeTruthy())
    act(() => {
      userEvent.selectOptions(documentSpacesSelect, documentSpaces[1].id);
    });

    const queryParams = new URLSearchParams(testLocation?.search);
    expect(queryParams.get('spaceId')).toEqual(documentSpaces[1].id);
  });
});

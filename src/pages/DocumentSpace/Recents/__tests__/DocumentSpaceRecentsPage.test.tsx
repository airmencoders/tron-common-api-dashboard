import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router';
import { ToastContainer } from '../../../../components/Toast/ToastContainer/ToastContainer';
import { DashboardUserControllerApi, DashboardUserDto, DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceResponseDto, DocumentSpacePrivilegeDtoTypeEnum } from '../../../../openapi';
import AuthorizedUserService from '../../../../state/authorized-user/authorized-user-service';
import { useAuthorizedUserState } from '../../../../state/authorized-user/authorized-user-state';
import DocumentSpacePrivilegeService from '../../../../state/document-space/document-space-privilege-service';
import DocumentSpaceService from '../../../../state/document-space/document-space-service';
import { useDocumentSpacePrivilegesState, useDocumentSpaceState } from '../../../../state/document-space/document-space-state';
import DocumentSpaceRecentsPage from '../DocumentSpaceRecentsPage';

jest.mock('../../../../state/document-space/document-space-state');
jest.mock('../../../../state/authorized-user/authorized-user-state');

describe('Document Space Recents Page Tests', () => {
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

  let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy;
  let dashboardUserApi: DashboardUserControllerApi;
  let authorizedUserService: AuthorizedUserService;

  beforeEach(() => {
    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);

    documentSpacePrivilegeState = createState<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>({});
    documentSpacePrivilegeService = new DocumentSpacePrivilegeService(
      documentSpaceApi,
      documentSpacePrivilegeState
    );

    authorizedUserState = createState<DashboardUserDto | undefined>(undefined);
    dashboardUserApi = new DashboardUserControllerApi();
    authorizedUserService = new AuthorizedUserService(authorizedUserState, dashboardUserApi);

    (useAuthorizedUserState as jest.Mock).mockReturnValue(authorizedUserService);
    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
    (useDocumentSpacePrivilegesState as jest.Mock).mockReturnValue(documentSpacePrivilegeService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should not request for privileges when user is DASHBOARD_ADMIN', async () => {
    jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(true);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
    const fetchAndStoreSpaces = jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces');
    const getPrivileges = jest.spyOn(documentSpacePrivilegeService, 'fetchAndStoreDashboardUserDocumentSpacesPrivileges');

    const { getByText } = render(
      <MemoryRouter>
        <DocumentSpaceRecentsPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchAndStoreSpaces).not.toHaveBeenCalled());
    await waitFor(() => expect(getPrivileges).not.toHaveBeenCalled());

    // Just test that Ag Grid loads in by finding one of the header columns
    expect(getByText('Name')).toBeInTheDocument();
  });

  it('should request for privileges when user is not DASHBOARD_ADMIN', async () => {
    jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(false);
    const loadingState = jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(true);
    const fetchAndStoreSpaces = jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
      promise: Promise.resolve(documentSpaces),
      cancelTokenSource: axios.CancelToken.source()
    });

    const privileges: Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>> = {};
    privileges[documentSpaces[0].id] = { READ: true, WRITE: false, MEMBERSHIP: false };
    const getPrivileges = jest.spyOn(documentSpacePrivilegeService, 'fetchAndStoreDashboardUserDocumentSpacesPrivileges').mockReturnValue({
      promise: Promise.resolve(privileges),
      cancelTokenSource: axios.CancelToken.source()
    });

    const { getByText, rerender } = render(
      <MemoryRouter>
        <DocumentSpaceRecentsPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchAndStoreSpaces).toHaveBeenCalled());
    await waitFor(() => expect(getPrivileges).toHaveBeenCalled());

    // rerender the page after loading everything in and loading is false
    loadingState.mockReturnValue(false);
    rerender(
      <MemoryRouter>
        <DocumentSpaceRecentsPage />
      </MemoryRouter>
    );

    // Just test that Ag Grid loads in by finding one of the header columns
    expect(getByText('Name')).toBeInTheDocument();
  });

  it('should show limited functionality toast if failed to get privileges', async () => {
    jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValueOnce(true);
    const fetchAndStoreSpaces = jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
      promise: Promise.resolve(documentSpaces),
      cancelTokenSource: axios.CancelToken.source()
    });
    const getPrivileges = jest.spyOn(documentSpacePrivilegeService, 'fetchAndStoreDashboardUserDocumentSpacesPrivileges').mockReturnValue({
      promise: Promise.reject(new Error('no privileges')),
      cancelTokenSource: axios.CancelToken.source()
    });

    const page = render(
      <MemoryRouter>
        <DocumentSpaceRecentsPage />
        <ToastContainer />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchAndStoreSpaces).toHaveBeenCalled());
    await waitFor(() => expect(getPrivileges).toHaveBeenCalled());

    // Test for toast showing limited functionality
    await expect(page.findByText(/Could not load privileges for authorized Document Spaces/)).resolves.toBeInTheDocument();
  });

  it('should show spinner while loading', async () => {
    jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(true);
    const fetchAndStoreSpaces = jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
      promise: Promise.resolve(documentSpaces),
      cancelTokenSource: axios.CancelToken.source()
    });
    const getPrivileges = jest.spyOn(documentSpacePrivilegeService, 'fetchAndStoreDashboardUserDocumentSpacesPrivileges').mockReturnValue({
      promise: Promise.reject(new Error('no privileges')),
      cancelTokenSource: axios.CancelToken.source()
    });

    const { getByText } = render(
      <MemoryRouter>
        <DocumentSpaceRecentsPage />
        <ToastContainer />
      </MemoryRouter>
    );

    // Test for spinner
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => expect(fetchAndStoreSpaces).toHaveBeenCalled());
    await waitFor(() => expect(getPrivileges).toHaveBeenCalled());
  });
});
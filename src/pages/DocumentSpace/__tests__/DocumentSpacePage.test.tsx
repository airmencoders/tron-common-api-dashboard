import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import {act, fireEvent, render, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import {MemoryRouter, Route} from 'react-router-dom';
import { ToastContainer } from '../../../components/Toast/ToastContainer/ToastContainer';
import {
  DashboardUserControllerApi,
  DashboardUserDto,
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpaceResponseDto,
  DocumentSpaceResponseDtoResponseWrapper,
  S3PaginationDto
} from '../../../openapi';
import AuthorizedUserService from '../../../state/authorized-user/authorized-user-service';
import { useAuthorizedUserState } from '../../../state/authorized-user/authorized-user-state';
import DocumentSpaceMembershipService from '../../../state/document-space/document-space-membership-service';
import DocumentSpaceService from '../../../state/document-space/document-space-service';
import { documentSpaceMembershipService, useDocumentSpaceState } from '../../../state/document-space/document-space-state';
import { createAxiosSuccessResponse, createGenericAxiosRequestErrorResponse } from '../../../utils/TestUtils/test-utils';
import DocumentSpacePage from '../DocumentSpacePage';

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

  let membershipService: DocumentSpaceMembershipService;

  let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy;
  let dashboardUserApi: DashboardUserControllerApi;
  let authorizedUserService: AuthorizedUserService;

  beforeEach(() => {
    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);

    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);

    authorizedUserState = createState<DashboardUserDto | undefined>(undefined);
    dashboardUserApi = new DashboardUserControllerApi();
    authorizedUserService = new AuthorizedUserService(authorizedUserState, dashboardUserApi);

    (useAuthorizedUserState as jest.Mock).mockReturnValue(authorizedUserService);
    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
    (documentSpaceMembershipService as jest.Mock).mockReturnValue(membershipService);
  });

  it('should show loading select when first retrieving Document Spaces', () => {
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(true);

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeDisabled();
    expect(documentSpacesSelect).toHaveValue('loading');

  });

  it('should show error select when retrieving Document Spaces fails', () => {
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.reject('Error'));
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(true);

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeDisabled();
    expect(documentSpacesSelect).toHaveValue('error');
  });

  it('should show Document Spaces options select with first item in state when state is not promised or errored', () => {
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);
    jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockImplementation(() => {
      return {
        promise: Promise.resolve(documentSpaces),
        cancelTokenSource: axios.CancelToken.source()
      }
    });

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeEnabled();
    expect(documentSpacesSelect).toHaveValue(documentSpaces[0].id);
  });

  it('should show DocumentSpaceMySettingButton when the user has at least one document space', () => {
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);
    jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockImplementation(() => {
      return {
        promise: Promise.resolve(documentSpaces),
        cancelTokenSource: axios.CancelToken.source()
      }
    });

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

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
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);
    jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
      promise: Promise.resolve(documentSpaces),
      cancelTokenSource: axios.CancelToken.source()
    });

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeEnabled();
    expect(documentSpacesSelect).toHaveValue(documentSpaces[0].id);

    userEvent.selectOptions(documentSpacesSelect, documentSpaces[1].id);
    await waitFor(() => expect(documentSpacesSelect).toHaveValue(documentSpaces[1].id));
  });

  it('should open/close Document Space Memberships modal', async () => {
    jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
    jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);
    jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
      promise: Promise.resolve(documentSpaces),
      cancelTokenSource: axios.CancelToken.source()
    });
    const getPrivilegesSpy = jest.spyOn(documentSpaceService, 'getDashboardUserPrivilegesForDocumentSpace').mockReturnValue(Promise.resolve({
      READ: false,
      WRITE: false,
      MEMBERSHIP: true
    }));

    const page = render(
      <MemoryRouter>
        <DocumentSpacePage />
      </MemoryRouter>
    );

    const documentSpacesSelect = page.getByLabelText('Spaces');
    expect(documentSpacesSelect).toBeEnabled();
    userEvent.selectOptions(documentSpacesSelect, documentSpaces[1].id);

    await waitFor(() => expect(getPrivilegesSpy).toHaveBeenCalledTimes(1));

    const membersButton = page.getByTitle('Manage Users');
    expect(membersButton).toBeInTheDocument();

    // Open the modal
    userEvent.click(membersButton);
    expect(page.getByText('Member Management')).toBeInTheDocument();

    // close the modal
    const closeButton = page.getByText('Close');
    expect(closeButton).toBeInTheDocument();
    userEvent.click(closeButton);
    expect(page.queryByText('Member Management')).not.toBeInTheDocument();
  });

  describe('Test error behaviors for document space privilege retrieval', () => {
    beforeEach(() => {
      jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
      jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(false);
      jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
      jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);
      jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
        promise: Promise.resolve(documentSpaces),
        cancelTokenSource: axios.CancelToken.source()
      });
    });

    it('should show error toast when failed to retrieve document space privileges', async () => {
      const getPrivilegesSpy = jest.spyOn(documentSpaceService, 'getDashboardUserPrivilegesForDocumentSpace')
        .mockReturnValue(Promise.reject(createGenericAxiosRequestErrorResponse(404)));

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

      await waitFor(() => expect(getPrivilegesSpy).toHaveBeenCalledTimes(1));
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
      const getPrivilegesSpy = jest.spyOn(documentSpaceService, 'getDashboardUserPrivilegesForDocumentSpace')
        .mockReturnValue(Promise.reject(createGenericAxiosRequestErrorResponse(403)));

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

      await waitFor(() => expect(getPrivilegesSpy).toHaveBeenCalledTimes(1));
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
    let fetchAndStoreSpacesSpy: jest.SpyInstance;
    beforeEach(() => {
      jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
      jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(false);
      jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
      jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);
      fetchAndStoreSpacesSpy = jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
        promise: Promise.resolve(documentSpaces),
        cancelTokenSource: axios.CancelToken.source()
      });
    });

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

    it('should show Memberships button when MEMBERSHIP privilege', async () => {
      const getPrivilegesSpy = jest.spyOn(documentSpaceService, 'getDashboardUserPrivilegesForDocumentSpace').mockReturnValueOnce(Promise.resolve({
        READ: false,
        WRITE: false,
        MEMBERSHIP: true
      }));

      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
        </MemoryRouter>
      );

      await waitFor(() => expect(getPrivilegesSpy).toHaveBeenCalledTimes(1));

      const membersButton = page.getByTitle('Manage Users');
      expect(membersButton).toBeInTheDocument();
    });

    it('should show Memberships button when DASHBOARD_ADMIN', async () => {
      jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(true);

      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
        </MemoryRouter>
      );

      await waitFor(() => expect(fetchAndStoreSpacesSpy).toHaveBeenCalledTimes(1));

      const membersButton = page.getByTitle('Manage Users');
      expect(membersButton).toBeInTheDocument();
    });

    it('should now show Memberships button when not DASHBOARD_ADMIN and not MEMBERSHIP', async () => {
      const getPrivilegesSpy = jest.spyOn(documentSpaceService, 'getDashboardUserPrivilegesForDocumentSpace').mockReturnValueOnce(Promise.resolve({
        READ: false,
        WRITE: false,
        MEMBERSHIP: false
      }));

      jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(false);

      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
        </MemoryRouter>
      );

      await waitFor(() => expect(getPrivilegesSpy).toHaveBeenCalledTimes(1));

      expect(page.queryByText('Manage Users')).not.toBeInTheDocument();
    });

    it('should show all Download buttons and Grid with READ privilege', async () => {
      const getPrivilegesSpy = jest.spyOn(documentSpaceService, 'getDashboardUserPrivilegesForDocumentSpace').mockReturnValueOnce(Promise.resolve({
        READ: true,
        WRITE: false,
        MEMBERSHIP: false
      }));

      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
        </MemoryRouter>
      );

      await waitFor(() => expect(getPrivilegesSpy).toHaveBeenCalledTimes(1));
      expect(page.getByTitle('Download Items')).toBeInTheDocument();
      // Test the grid is rendered by trying to find one of the column headers
      expect(page.getByText('Name')).toBeInTheDocument();
    });

    it('should show all Download buttons and Grid with DASHBOARD_ADMIN privilege', async () => {
      jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(true);

      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
        </MemoryRouter>
      );

      await waitFor(() => expect(fetchAndStoreSpacesSpy).toHaveBeenCalledTimes(1));

      expect(page.getByTitle('Download Items')).toBeInTheDocument();
      // Test the grid is rendered by trying to find one of the column headers
      expect(page.getByText('Name')).toBeInTheDocument();
    });

    it('should not show all Download buttons and Grid when not READ', async () => {
      const getPrivilegesSpy = jest.spyOn(documentSpaceService, 'getDashboardUserPrivilegesForDocumentSpace').mockReturnValueOnce(Promise.resolve({
        READ: false,
        WRITE: false,
        MEMBERSHIP: false
      }));

      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
        </MemoryRouter>
      );

      await waitFor(() => expect(getPrivilegesSpy).toHaveBeenCalledTimes(1));
      expect(page.queryByTitle('Download Items')).not.toBeInTheDocument();
      // Test the grid is rendered by trying to find one of the column headers
      expect(page.queryByText('Name')).not.toBeInTheDocument();
    });

    it('should show Upload Files button with WRITE privilege', async () => {
      const getPrivilegesSpy = jest.spyOn(documentSpaceService, 'getDashboardUserPrivilegesForDocumentSpace').mockReturnValueOnce(Promise.resolve({
        READ: false,
        WRITE: true,
        MEMBERSHIP: false
      }));

      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
        </MemoryRouter>
      );

      await waitFor(() => expect(getPrivilegesSpy).toHaveBeenCalledTimes(1));
      expect(page.getByTitle('Upload Files')).toBeInTheDocument();
    });

    it('should show Upload Files button with DASHBOARD_ADMIN privilege', async () => {
      jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(true);

      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
        </MemoryRouter>
      );

      await waitFor(() => expect(fetchAndStoreSpacesSpy).toHaveBeenCalledTimes(1));
      expect(page.getByTitle('Upload Files')).toBeInTheDocument();
    });

    it('should not show Upload Files button when not WRITE privilege', async () => {
      const getPrivilegesSpy = jest.spyOn(documentSpaceService, 'getDashboardUserPrivilegesForDocumentSpace').mockReturnValueOnce(Promise.resolve({
        READ: false,
        WRITE: false,
        MEMBERSHIP: false
      }));

      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
        </MemoryRouter>
      );

      await waitFor(() => expect(getPrivilegesSpy).toHaveBeenCalledTimes(1));
      expect(page.queryByTitle('Upload Files')).not.toBeInTheDocument();
    });

    it('should update the url when navigating to another space', async () => {
      jest.spyOn(documentSpaceApi, 'getSpaces').mockReturnValue(Promise.resolve(getSpacesResponse));
      jest.spyOn(documentSpaceService, 'isDocumentSpacesStateErrored', 'get').mockReturnValue(false);
      jest.spyOn(documentSpaceService, 'isDocumentSpacesStatePromised', 'get').mockReturnValue(false);
      jest.spyOn(documentSpaceService, 'documentSpaces', 'get').mockReturnValue(documentSpaces);
      jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockImplementation(() => {
        return {
          promise: Promise.resolve(documentSpaces),
          cancelTokenSource: axios.CancelToken.source()
        }
      });

      let testHistory: any;
      let testLocation: any;
      const page = render(
        <MemoryRouter>
          <DocumentSpacePage />
          <Route
            path="*"
            render={({history, location}) => {
              testHistory = history;
              testLocation = location;
              return null;
            }}
          />
        </MemoryRouter>
      );
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
});

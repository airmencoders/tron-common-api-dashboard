import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router';
import {
  DashboardUserControllerApi,
  DashboardUserDto,
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceResponseDto,
  DocumentSpaceUserCollectionResponseDto
} from '../../../../openapi';
import AuthorizedUserService from '../../../../state/authorized-user/authorized-user-service';
import {
  accessAuthorizedUserState,
  useAuthorizedUserState
} from '../../../../state/authorized-user/authorized-user-state';
import DocumentSpaceDownloadUrlService from '../../../../state/document-space/document-space-download-url-service';
import DocumentSpaceGlobalService, { DocumentSpaceGlobalState } from '../../../../state/document-space/document-space-global-service';
import DocumentSpacePrivilegeService from "../../../../state/document-space/document-space-privilege-service";
import DocumentSpaceService from '../../../../state/document-space/document-space-service';
import {
  documentSpaceDownloadUrlService,
  useDocumentSpaceGlobalState,
  useDocumentSpacePrivilegesState,
  useDocumentSpaceState
} from '../../../../state/document-space/document-space-state';
import { createAxiosSuccessResponse } from "../../../../utils/TestUtils/test-utils";
import DocumentSpaceFavoritesPage from '../DocumentSpaceFavoritesPage';

jest.mock('../../../../state/document-space/document-space-state');
jest.mock('../../../../state/authorized-user/authorized-user-state');

describe('Document Space Favorites Page Tests', () => {
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
  const favorites: DocumentSpaceUserCollectionResponseDto[] = [
    {
      id: 'id1',
      itemId: 'itemId1',
      documentSpaceId: '412ea028-1fc5-41e0-b48a-c6ef090704d3',
      key: 'title',
      lastModifiedDate: '',
      folder: false,
      metadata: {}
    }, 
    {
      id: 'id2',
      itemId: 'itemId2',
      documentSpaceId: '52909027-69f6-4d0c-83da-293bc2d9d2f8',
      key: 'folder',
      lastModifiedDate: '',
      parentId: 'parentFolderId',
      folder: true,
      metadata: {}
    },
    {
      id: 'id3',
      itemId: 'itemId3',
      documentSpaceId: '52909027-69f6-4d0c-83da-293bc2d9d2f8',
      key: 'file2',
      lastModifiedDate: '',
      parentId: 'parentFolderId',
      folder: false,
      metadata: {}
    },
  ];

  let documentSpacesState: State<DocumentSpaceResponseDto[]> & StateMethodsDestroy;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;

  let globalDocumentSpaceState: State<DocumentSpaceGlobalState>;
  let globalDocumentSpaceService: DocumentSpaceGlobalService;

  let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy;
  let dashboardUserApi: DashboardUserControllerApi;
  let authorizedUserService: AuthorizedUserService;

  let documentSpacePrivilegeState: State<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>;
  let documentSpacePrivilegeService: DocumentSpacePrivilegeService;

  let downloadUrlService: DocumentSpaceDownloadUrlService;

  beforeEach(() => {

    documentSpacesState = createState<DocumentSpaceResponseDto[]>(documentSpaces);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);

    globalDocumentSpaceState = createState<DocumentSpaceGlobalState>({
      currentDocumentSpace: undefined
    });
    globalDocumentSpaceService = new DocumentSpaceGlobalService(globalDocumentSpaceState);

    authorizedUserState = createState<DashboardUserDto | undefined>(undefined);
    dashboardUserApi = new DashboardUserControllerApi();
    authorizedUserService = new AuthorizedUserService(authorizedUserState, dashboardUserApi);

    documentSpacePrivilegeState = createState<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>({});
    documentSpacePrivilegeService = new DocumentSpacePrivilegeService(
      documentSpaceApi,
      documentSpacePrivilegeState
    );

    downloadUrlService = new DocumentSpaceDownloadUrlService();

    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
    (useDocumentSpacePrivilegesState as jest.Mock).mockReturnValue(documentSpacePrivilegeService);
    (accessAuthorizedUserState as jest.Mock).mockReturnValue(authorizedUserService);
    (useAuthorizedUserState as jest.Mock).mockReturnValue(authorizedUserService);
    (useDocumentSpaceGlobalState as jest.Mock).mockReturnValue(globalDocumentSpaceService);
    (documentSpaceDownloadUrlService as jest.Mock).mockReturnValue(downloadUrlService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the page', async () => {
    jest.spyOn(documentSpaceApi, 'getFavorites').mockReturnValue(Promise.resolve(createAxiosSuccessResponse({data: favorites })))
    jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
      promise: Promise.resolve(documentSpaces),
      cancelTokenSource: axios.CancelToken.source()
    })
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction').mockReturnValue(true);

    const {getByText} = render(
      <MemoryRouter>
        <DocumentSpaceFavoritesPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(getByText('Favorite files and folders')).toBeVisible());
  });

  it('can list favorites for a space', async () => {
    const spaceChangeMock = jest.spyOn(documentSpaceApi, 'getFavorites').mockImplementation(id => {
      return Promise.resolve(createAxiosSuccessResponse({ data: favorites.filter(item => item.documentSpaceId === id) }))
    })
    jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
        promise: Promise.resolve(documentSpaces),
        cancelTokenSource: axios.CancelToken.source()
    });
    jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(true);
    jest.spyOn(documentSpacePrivilegeService, 'isAuthorizedForAction').mockReturnValue(true);
    jest.spyOn(downloadUrlService, 'createRelativeDownloadFileUrlBySpaceAndParent').mockReturnValue('i_am_a_download_link');
    jest.spyOn(globalDocumentSpaceService, 'setCurrentDocumentSpace');
    jest.spyOn(globalDocumentSpaceService, 'getInitialSelectedDocumentSpace').mockReturnValue(documentSpaces[0])

    const page = render(
      <MemoryRouter>
        <DocumentSpaceFavoritesPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(page.getByTestId('document-space-selector')).toBeInTheDocument());
    await waitFor(() => expect(page.getByDisplayValue('space1')).toBeVisible());
    await waitFor(() => expect(page.getByText('title')).toBeInTheDocument());

    fireEvent.change(page.getByTestId('document-space-selector'), { target: { value: 'space2'}});
    await waitFor(() => expect(spaceChangeMock).toHaveBeenCalled());


  });
});
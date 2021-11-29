import {createState, State, StateMethodsDestroy} from '@hookstate/core';
import {render, waitFor} from '@testing-library/react';
import axios from 'axios';
import {MemoryRouter} from 'react-router';
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
import DocumentSpaceService from '../../../../state/document-space/document-space-service';
import {
  documentSpaceMembershipService,
  useDocumentSpacePrivilegesState,
  useDocumentSpaceState
} from '../../../../state/document-space/document-space-state';
import DocumentSpaceFavoritesPage from '../DocumentSpaceFavoritesPage';
import DocumentSpacePrivilegeService from "../../../../state/document-space/document-space-privilege-service";
import {createAxiosSuccessResponse} from "../../../../utils/TestUtils/test-utils";
import DocumentSpaceArchivedItemsPage from "../../DocumentSpaceArchivedItemsPage";
import DocumentSpaceMembershipService from "../../../../state/document-space/document-space-membership-service";

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
  const favorties: DocumentSpaceUserCollectionResponseDto[] = [
    {
      id: 'id1',
      itemId: 'itemId1',
      documentSpaceId: 'docSpaceId',
      key: 'title',
      lastModifiedDate: '',
      folder: false,
      metadata: {}
    }, 
    {
      id: 'id2',
      itemId: 'itemId2',
      documentSpaceId: 'docSpaceId',
      key: 'folder',
      lastModifiedDate: '',
      parentId: 'parentFolderId',
      folder: true,
      metadata: {}
    },
  ];

  let documentSpacesState: State<DocumentSpaceResponseDto[]> & StateMethodsDestroy;
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpaceService: DocumentSpaceService;

  let authorizedUserState: State<DashboardUserDto | undefined> & StateMethodsDestroy;
  let dashboardUserApi: DashboardUserControllerApi;
  let authorizedUserService: AuthorizedUserService;

  let documentSpacePrivilegeState: State<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>;
  let documentSpacePrivilegeService: DocumentSpacePrivilegeService

  beforeEach(() => {

    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);

    authorizedUserState = createState<DashboardUserDto | undefined>(undefined);
    dashboardUserApi = new DashboardUserControllerApi();
    authorizedUserService = new AuthorizedUserService(authorizedUserState, dashboardUserApi);

    documentSpacePrivilegeState = createState<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>({});
    documentSpacePrivilegeService = new DocumentSpacePrivilegeService(
      documentSpaceApi,
      documentSpacePrivilegeState
    );


    (useAuthorizedUserState as jest.Mock).mockReturnValue(authorizedUserService);
    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
    (useDocumentSpacePrivilegesState as jest.Mock).mockReturnValue(documentSpacePrivilegeService);
    (accessAuthorizedUserState as jest.Mock).mockReturnValue(new AuthorizedUserService(authorizedUserState, dashboardUserApi));

    // const getFavorites = jest.spyOn(documentSpaceApi, 'getFavorites').mockReturnValue(Promise.resolve(createAxiosSuccessResponse({data: favorties})))

    documentSpacesState = createState<DocumentSpaceResponseDto[]>([]);
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpaceService = new DocumentSpaceService(documentSpaceApi, documentSpacesState);



    (useAuthorizedUserState as jest.Mock).mockReturnValue(authorizedUserService);
    (useDocumentSpaceState as jest.Mock).mockReturnValue(documentSpaceService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });


  it('renders the page', async () => {
    jest.spyOn(documentSpaceApi, 'getFavorites').mockReturnValue(Promise.resolve(createAxiosSuccessResponse({data: favorties})))

    jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(true);

    const {getByText} = render(
      <MemoryRouter>
        <DocumentSpaceFavoritesPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(getByText('Favorite files and folders')).toBeVisible());
  });

});
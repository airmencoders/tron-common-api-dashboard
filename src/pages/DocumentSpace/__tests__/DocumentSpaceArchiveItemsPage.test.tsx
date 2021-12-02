import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { render, waitFor } from '@testing-library/react';
import { AxiosResponse } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { InfiniteScrollOptions } from '../../../components/DataCrudFormPage/infinite-scroll-options';
import { generateInfiniteScrollLimit } from '../../../components/Grid/GridUtils/grid-utils';
import {
  DashboardUserControllerApi,
  DashboardUserDto,
  DocumentDto,
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpaceResponseDto,
  S3PaginationDto
} from '../../../openapi';
import AuthorizedUserService from '../../../state/authorized-user/authorized-user-service';
import { useAuthorizedUserState } from '../../../state/authorized-user/authorized-user-state';
import DocumentSpaceMembershipService from '../../../state/document-space/memberships/document-space-membership-service';
import DocumentSpaceService from '../../../state/document-space/document-space-service';
import {
  documentSpaceMembershipService,
  useDocumentSpaceState
} from '../../../state/document-space/document-space-state';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';
import DocumentSpaceArchivedItemsPage from '../DocumentSpaceArchivedItemsPage';

jest.mock('../../../state/document-space/document-space-state');
jest.mock('../../../state/authorized-user/authorized-user-state');

describe('Document Space Archive Items Page Tests', () => {
  const documents: DocumentDto[] = [
    {
      spaceId: '407bf847-5ac7-485c-842f-c9efaf8a6b5d',
      key: 'file2.txt',
      path: 'test2',
      size: 20000,
      lastModifiedBy: '',
      lastModifiedDate: '2021-09-17T15:09:10.154Z',
    },
  ];

  const infiniteScrollOptions: InfiniteScrollOptions = {
    enabled: true,
    limit: 5,
  };

  const listObjectsResponse: AxiosResponse<S3PaginationDto> = createAxiosSuccessResponse({
    documents: documents,
    currentContinuationToken: '',
    nextContinuationToken: '',
    size: generateInfiniteScrollLimit(infiniteScrollOptions),
    totalElements: documents.length,
  });

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

  it('should list items that are archived', async () => {
    const mockDelete = jest.fn();
    jest
      .spyOn(documentSpaceApi, 'getAllArchivedFilesForAuthUser')
      .mockReturnValue(Promise.resolve(listObjectsResponse));
    jest.spyOn(documentSpaceService, 'deleteItems').mockImplementation(mockDelete);
    jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(true);

    const page = render(
      <MemoryRouter>
        <DocumentSpaceArchivedItemsPage />
      </MemoryRouter>
    );
    await waitFor(() => expect(page.getByText('Document Space Archived Items')).toBeVisible());
  });
});

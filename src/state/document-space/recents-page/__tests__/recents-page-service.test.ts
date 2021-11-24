import { createState, State, StateMethodsDestroy } from '@hookstate/core';
import { waitFor } from '@testing-library/dom';
import axios from 'axios';
import { MutableRefObject } from 'react';
import { InfiniteScrollOptions } from '../../../../components/DataCrudFormPage/infinite-scroll-options';
import { DashboardUserControllerApi, DashboardUserDto, DocumentSpaceControllerApi, DocumentSpaceControllerApiInterface, DocumentSpaceResponseDto, DocumentSpacePrivilegeDtoTypeEnum } from '../../../../openapi';
import AuthorizedUserService from '../../../../state/authorized-user/authorized-user-service';
import DocumentSpacePrivilegeService from '../../../../state/document-space/document-space-privilege-service';
import DocumentSpaceService from '../../../../state/document-space/document-space-service';
import RecentsPageService from '../recents-page-service';
import { RecentsPageState } from '../recents-page-state';

jest.mock('../../../../state/document-space/document-space-state');

describe('Document Space Recents Page Tests', () => {
  const infiniteScrollOptions: InfiniteScrollOptions = {
    enabled: true,
    limit: 100,
  };

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

  let mountedRef: MutableRefObject<boolean>;

  let recentsPageState: State<RecentsPageState>;
  let recentsPageService: RecentsPageService;

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

    mountedRef = {
      current: true
    };

    recentsPageState = createState<RecentsPageState>({
      datasource: undefined,
      shouldUpdateInfiniteCache: false,
      selectedFile: undefined,
      showDeleteDialog: false,
      renameFormState: {
        isSubmitting: false,
        isOpen: false
      },
      pageStatus: {
        isLoading: false,
        isError: false,
        message: undefined
      }
    });
    recentsPageService = new RecentsPageService(
      documentSpaceApi,
      recentsPageState,
      mountedRef,
      authorizedUserService,
      documentSpaceService,
      documentSpacePrivilegeService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('test fetching authorized document spaces, privileges, and state', () => {
    it('should fetch when not a DASHBOARD_ADMIN', async () => {
      jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(false);
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

      await recentsPageService.fetchSpacesAndPrivileges(infiniteScrollOptions);

      await waitFor(() => expect(fetchAndStoreSpaces).toHaveBeenCalled());
      await waitFor(() => expect(getPrivileges).toHaveBeenCalled());

      expect(recentsPageState.datasource.value).toBeDefined();
      expect(recentsPageState.pageStatus.value).toEqual({
        isLoading: false,
        isError: false,
        message: undefined
      });
    });

    it('should error state when fetching authorized document spaces fail', async () => {
      jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(false);
      const fetchAndStoreSpaces = jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
        promise: Promise.reject('authorized document spaces error'),
        cancelTokenSource: axios.CancelToken.source()
      });

      const getPrivileges = jest.spyOn(documentSpacePrivilegeService, 'fetchAndStoreDashboardUserDocumentSpacesPrivileges');

      await recentsPageService.fetchSpacesAndPrivileges(infiniteScrollOptions);

      await waitFor(() => expect(fetchAndStoreSpaces).toHaveBeenCalled());
      expect(getPrivileges).not.toHaveBeenCalled();

      expect(recentsPageState.pageStatus.value).toEqual({
        isLoading: false,
        isError: true,
        message: 'Failed to fetch your authorized Document Spaces'
      });
      expect(recentsPageState.datasource.value).not.toBeDefined();
    });

    it('should not error state if only privilege retrieval failed; datasource still set', async () => {
      jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockReturnValue(false);
      const fetchAndStoreSpaces = jest.spyOn(documentSpaceService, 'fetchAndStoreSpaces').mockReturnValue({
        promise: Promise.resolve(documentSpaces),
        cancelTokenSource: axios.CancelToken.source()
      });

      const getPrivileges = jest.spyOn(documentSpacePrivilegeService, 'fetchAndStoreDashboardUserDocumentSpacesPrivileges').mockReturnValue({
        promise: Promise.reject('privileges request failed'),
        cancelTokenSource: axios.CancelToken.source()
      });

      await recentsPageService.fetchSpacesAndPrivileges(infiniteScrollOptions);

      await waitFor(() => expect(fetchAndStoreSpaces).toHaveBeenCalled());
      await waitFor(() => expect(getPrivileges).toHaveBeenCalled());

      expect(recentsPageState.pageStatus.value).toEqual({
        isLoading: false,
        isError: false,
        message: undefined
      });
      expect(recentsPageState.datasource.value).toBeDefined();
    });
  });
});
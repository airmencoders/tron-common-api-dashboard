import { createState, State } from '@hookstate/core';
import {
  DashboardUserControllerApi,
  DashboardUserDto,
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpacePrivilegeDtoResponseWrapper,
  DocumentSpacePrivilegeDtoTypeEnum,
} from '../../../openapi';
import { createAxiosSuccessResponse } from '../../../utils/TestUtils/test-utils';
import AuthorizedUserService from '../../authorized-user/authorized-user-service';
import { accessAuthorizedUserState } from '../../authorized-user/authorized-user-state';
import DocumentSpacePrivilegeService from '../document-space-privilege-service';

jest.mock('../../authorized-user/authorized-user-state');

describe('Test Document Space Privilege Service', () => {
  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let documentSpacePrivilegeState: State<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>;
  let documentSpacePrivilegeService: DocumentSpacePrivilegeService;

  let authorizedUserState: State<DashboardUserDto | undefined>;
  let dashboardUserApi: DashboardUserControllerApi;
  let authorizedUserService: AuthorizedUserService;

  const documentSpaceIds = [
    '412ea028-1fc5-41e0-b48a-c6ef090704d3',
    '412ea028-1fc5-41e0-b48a-c6ef090704d4'
  ];

  beforeEach(() => {
    jest.resetAllMocks();

    authorizedUserService = new AuthorizedUserService(authorizedUserState, dashboardUserApi);
    authorizedUserState = createState<DashboardUserDto | undefined>(undefined);
    dashboardUserApi = new DashboardUserControllerApi();
    (accessAuthorizedUserState as jest.Mock).mockReturnValue(authorizedUserService);

    documentSpacePrivilegeState = createState<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>({});
    documentSpaceApi = new DocumentSpaceControllerApi();
    documentSpacePrivilegeService = new DocumentSpacePrivilegeService(
      documentSpaceApi,
      documentSpacePrivilegeState
    );
  });

  function resetTimers() {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  };

  it('should retrieve all privileges for a dashboard user of a specific document space', async () => {
    const mock = jest.spyOn(documentSpaceApi, 'getSelfDashboardUserPrivilegesForDocumentSpace').mockReturnValue(
      Promise.resolve(
        createAxiosSuccessResponse<DocumentSpacePrivilegeDtoResponseWrapper>({
          data: [
            {
              id: 'privilege-id-1',
              type: DocumentSpacePrivilegeDtoTypeEnum.Read
            },
            {
              id: 'privilege-id-2',
              type: DocumentSpacePrivilegeDtoTypeEnum.Write
            }
          ]
        })
      )
    );

    const response = await documentSpacePrivilegeService.fetchAndStoreDashboardUserDocumentSpacePrivileges(documentSpaceIds[0]).promise;
    expect(mock).toHaveBeenCalled();
    expect(response).toEqual({
      [documentSpaceIds[0]]: {
        [DocumentSpacePrivilegeDtoTypeEnum.Read]: true,
        [DocumentSpacePrivilegeDtoTypeEnum.Write]: true,
        [DocumentSpacePrivilegeDtoTypeEnum.Membership]: false
      }
    });
  });

  it('should retrieve all privileges for a dashboard user pertaining to all document spaces they have access to', async () => {
    const mock = jest.spyOn(documentSpaceApi, 'getSelfDashboardUserPrivilegesForDocumentSpace')
      .mockReturnValueOnce(
        Promise.resolve(
          createAxiosSuccessResponse<DocumentSpacePrivilegeDtoResponseWrapper>({
            data: [
              {
                id: 'privilege-id-1',
                type: DocumentSpacePrivilegeDtoTypeEnum.Read
              }
            ]
          })
        )
      )
      .mockReturnValueOnce(
        Promise.resolve(
          createAxiosSuccessResponse<DocumentSpacePrivilegeDtoResponseWrapper>({
            data: [
              {
                id: 'privilege-id-1',
                type: DocumentSpacePrivilegeDtoTypeEnum.Read
              },
              {
                id: 'privilege-id-2',
                type: DocumentSpacePrivilegeDtoTypeEnum.Write
              }
            ]
          })
        )
      );

    const response = await documentSpacePrivilegeService.fetchAndStoreDashboardUserDocumentSpacesPrivileges(new Set(documentSpaceIds)).promise;
    expect(mock).toHaveBeenCalledTimes(2);

    const result: Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>> = {};
    result[documentSpaceIds[0]] = { READ: true, WRITE: false, MEMBERSHIP: false };
    result[documentSpaceIds[1]] = { READ: true, WRITE: true, MEMBERSHIP: false };
    expect(response).toEqual(result);
  });

  it('isAuthorizedForAction should return true when user has DASHBOARD_ADMIN privilege', () => {
    jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockImplementation(() => true);
    expect(documentSpacePrivilegeService.isAuthorizedForAction('id', DocumentSpacePrivilegeDtoTypeEnum.Write)).toBeTruthy();
  });

  it('isAuthorizedForAction should return false when state is not ready', async () => {
    jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockImplementation(() => false);

    jest.useFakeTimers();

    // promised
    const pendingPromise = Promise.resolve({ 'id': { READ: true, WRITE: false, MEMBERSHIP: false } });
    documentSpacePrivilegeState.set(pendingPromise);
    expect(documentSpacePrivilegeService.isAuthorizedForAction('id', DocumentSpacePrivilegeDtoTypeEnum.Write)).toBeFalsy();
    jest.runOnlyPendingTimers();
    await pendingPromise;

    // errored
    const errorPromise = Promise.reject(new Error('rejected'));
    documentSpacePrivilegeState.set(errorPromise);
    jest.runOnlyPendingTimers();
    await expect(errorPromise).rejects.toBeTruthy();
    expect(documentSpacePrivilegeService.isAuthorizedForAction('id', DocumentSpacePrivilegeDtoTypeEnum.Write)).toBeFalsy();

    resetTimers();
  });

  it('isAuthorizedForAction should return appropriately for user privileges', () => {
    jest.spyOn(authorizedUserService, 'authorizedUserHasPrivilege').mockImplementation(() => false);

    documentSpacePrivilegeState.set({ 'id': { READ: true, WRITE: true, MEMBERSHIP: false } });

    expect(documentSpacePrivilegeService.isAuthorizedForAction('id', DocumentSpacePrivilegeDtoTypeEnum.Write)).toBeTruthy();
    expect(documentSpacePrivilegeService.isAuthorizedForAction('id', DocumentSpacePrivilegeDtoTypeEnum.Membership)).toBeFalsy();

    // should also return false if the document space id does not exist in state
    expect(documentSpacePrivilegeService.isAuthorizedForAction('does not exist id', DocumentSpacePrivilegeDtoTypeEnum.Membership)).toBeFalsy();
  });

  it('should reset state', async () => {
    jest.useFakeTimers();

    const pendingPromise = Promise.resolve({ 'id': { READ: true, WRITE: false, MEMBERSHIP: false } });
    documentSpacePrivilegeState.set(pendingPromise);

    // should not attempt to reset state when promised
    expect(documentSpacePrivilegeState.promised).toBeTruthy();
    documentSpacePrivilegeService.resetState();
    jest.runOnlyPendingTimers();
    await pendingPromise;

    // should reset state when not promised
    documentSpacePrivilegeService.resetState();
    expect(documentSpacePrivilegeState.value).toEqual({});

    resetTimers();
  });
});

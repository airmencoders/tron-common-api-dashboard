import { waitFor } from '@testing-library/dom';
import { AxiosResponse } from 'axios';
import { InfiniteScrollOptions } from '../../../../components/DataCrudFormPage/infinite-scroll-options';
import {
  AppClientSummaryDtoResponseWrapper,
  DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum,
  DocumentSpaceAppClientResponseDto,
  DocumentSpaceAppClientResponseDtoPrivilegesEnum,
  DocumentSpaceAppClientResponseDtoWrapper,
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum,
  DocumentSpaceDashboardMemberResponseDto,
  DocumentSpaceDashboardMemberResponseDtoResponseWrapper,
  DocumentSpacePrivilegeDtoTypeEnum
} from '../../../../openapi';
import { resolvePrivName, unResolvePrivName, getHighestPrivForMember } from '../../../../utils/document-space-utils';
import {
  createAxiosSuccessResponse,
  createGenericAxiosRequestErrorResponse,
} from '../../../../utils/TestUtils/test-utils';
import DocumentSpaceMembershipService, { MemberTypeEnum } from '../document-space-membership-service';
import { DocumentSpacePrivilegeNiceName } from '../document-space-privilege-nice-name';

describe('Test Document Space Membership Service', () => {
  const infiniteScrollOptions: InfiniteScrollOptions = {
    enabled: true,
    limit: 5,
  };

  const documentSpaceId = 'b8529a48-a61c-45a7-b0d1-2eb5d429d3bf';

  const appClientMembers: DocumentSpaceAppClientResponseDto[] = [
    {
      appClientId: 'some app id1',
      appClientName: 'app1',
      privileges: [ DocumentSpaceAppClientResponseDtoPrivilegesEnum.Membership,
        DocumentSpaceAppClientResponseDtoPrivilegesEnum.Read,
        DocumentSpaceAppClientResponseDtoPrivilegesEnum.Write
      ]
    }, {
      appClientId: 'some app id2',
      appClientName: 'app2',
      privileges: [ DocumentSpaceAppClientResponseDtoPrivilegesEnum.Read ]
    },
  ];

  const members: DocumentSpaceDashboardMemberResponseDto[] = [
    {
      id: '55ba3157-5985-4b94-871f-61f0919e8c86',
      email: 'test@dev.com',
      privileges: [
        {
          id: 'fac148f7-b8ce-4463-96fc-92fcce6fd254',
          type: DocumentSpacePrivilegeDtoTypeEnum.Membership
        }
      ]
    },
    {
      id: '407bf847-5ac7-485c-842f-c9efaf8a6b5d',
      email: 'test1@dev.com',
      privileges: [
        {
          id: '90f4d33b-b761-4a29-bcdd-1bf8fe46831c',
          type: DocumentSpacePrivilegeDtoTypeEnum.Read
        }
      ]
    },
    {
      id: '407bf847-5ac7-485c-842f-c9efaf8a6b5e',
      email: 'test2@dev.com',
      privileges: [
        {
          id: '90f4d33b-b761-4a29-bcdd-1bf8fe46831c',
          type: DocumentSpacePrivilegeDtoTypeEnum.Read
        },
        {
          id: '90f4d33b-b761-4a29-bcdd-1bf8fe46831d',
          type: DocumentSpacePrivilegeDtoTypeEnum.Write
        }
      ]
    }
  ];

  const membersResponse: AxiosResponse<DocumentSpaceDashboardMemberResponseDtoResponseWrapper> = createAxiosSuccessResponse(
    {
      data: members
    }
  );

  const appClientMembersResponse: AxiosResponse<DocumentSpaceAppClientResponseDtoWrapper> = createAxiosSuccessResponse(
    {
      data: appClientMembers
    }
  );

  let documentSpaceApi: DocumentSpaceControllerApiInterface;
  let membershipService: DocumentSpaceMembershipService;


  beforeEach(() => {
    documentSpaceApi = new DocumentSpaceControllerApi();
    membershipService = new DocumentSpaceMembershipService(documentSpaceApi);
  });

  it('should create datasource and fetch members', (done) => {
    documentSpaceApi.getDashboardUsersForDocumentSpace = jest.fn(() => {
      return Promise.resolve(membersResponse);
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'getDashboardUsersForDocumentSpace');

    const onSuccess = jest.fn((data, lastRow) => {
      try {
        expect(data).toEqual(
          expect.arrayContaining(membersResponse.data.data)
        );
        done();
      } catch (err) {
        done(err);
      }
    });
    const onFail = jest.fn();
    const datasource = membershipService.createMembersDatasource(
      documentSpaceId,
      infiniteScrollOptions
    );
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [],
      filterModel: {},
      context: undefined,
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should create datasource and fetch app client members', (done) => {
    documentSpaceApi.getAppClientUsersForDocumentSpace = jest.fn(() => {
      return Promise.resolve(appClientMembersResponse);
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'getAppClientUsersForDocumentSpace');

    const onSuccess = jest.fn((data, lastRow) => {
      try {
        expect(data).toEqual(
          expect.arrayContaining(appClientMembersResponse.data.data)
        );
        done();
      } catch (err) {
        done(err);
      }
    });
    const onFail = jest.fn();
    const datasource = membershipService.createMembersDatasource(
      documentSpaceId,
      infiniteScrollOptions,
      MemberTypeEnum.APP_CLIENT
    );
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [],
      filterModel: {},
      context: undefined,
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });


  it('should create datasource and fail on server error response', (done) => {
    const badRequestError = createGenericAxiosRequestErrorResponse(500);

    documentSpaceApi.getDashboardUsersForDocumentSpace = jest.fn(() => {
      return Promise.reject(badRequestError);
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'getDashboardUsersForDocumentSpace');

    const onSuccess = jest.fn();
    const onFail = jest.fn(() => {
      try {
        done();
      } catch (err) {
        done(err);
      }
    });
    const datasource = membershipService.createMembersDatasource(
      documentSpaceId,
      infiniteScrollOptions
    );
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [],
      filterModel: {},
      context: undefined,
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should create datasource and fail on server error respons for app client members', (done) => {
    const badRequestError = createGenericAxiosRequestErrorResponse(500);

    documentSpaceApi.getAppClientUsersForDocumentSpace = jest.fn(() => {
      return Promise.reject(badRequestError);
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'getAppClientUsersForDocumentSpace');

    const onSuccess = jest.fn();
    const onFail = jest.fn(() => {
      try {
        done();
      } catch (err) {
        done(err);
      }
    });
    const datasource = membershipService.createMembersDatasource(
      documentSpaceId,
      infiniteScrollOptions,
      MemberTypeEnum.APP_CLIENT
    );
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [],
      filterModel: {},
      context: undefined,
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should create datasource and fail on catch all', (done) => {
    documentSpaceApi.getDashboardUsersForDocumentSpace = jest.fn(() => {
      return Promise.reject(new Error('Catch all exception'));
    });

    const apiRequestSpy = jest.spyOn(documentSpaceApi, 'getDashboardUsersForDocumentSpace');

    const onSuccess = jest.fn();
    const onFail = jest.fn(() => {
      try {
        done();
      } catch (err) {
        done(err);
      }
    });
    const datasource = membershipService.createMembersDatasource(
      documentSpaceId,
      infiniteScrollOptions
    );
    datasource.getRows({
      successCallback: onSuccess,
      failCallback: onFail,
      startRow: 0,
      endRow: 100,
      sortModel: [],
      filterModel: {},
      context: undefined,
    });

    expect(apiRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should add new member', async () => {
    const response = jest.fn(() => {
      return Promise.resolve(createAxiosSuccessResponse({}));
    });
    const addMemberApiSpy = jest.spyOn(documentSpaceApi, 'addUserToDocumentSpace').mockImplementation(response);

    membershipService.addDocumentSpaceMember(documentSpaceId, {
      email: 'test@dev.com',
      privileges: [
        DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Write
      ]
    });

    await waitFor(() => expect(addMemberApiSpy).toHaveBeenCalledTimes(1));
  });

  it('should add new app client member', async () => {
    const response = jest.fn(() => {
      return Promise.resolve(createAxiosSuccessResponse({}));
    });
    const addMemberApiSpy = jest.spyOn(documentSpaceApi, 'addAppClientToDocumentSpace').mockImplementation(response);

    // add new app client member with using its app client ID and privilege (none is READ only)
    membershipService.addDocumentSpaceAppClientMember(documentSpaceId, {
      appClientId: 'some id3',
      privileges: [
        DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum.Write
      ]
    });

    await waitFor(() => expect(addMemberApiSpy).toHaveBeenCalledTimes(1));
  });

  it('should remove members', async () => {
    const response = jest.fn(() => {
      return Promise.resolve(createAxiosSuccessResponse({}));
    });
    const removeMemberApiSpy = jest.spyOn(documentSpaceApi, 'removeUserFromDocumentSpace').mockImplementation(response);

    membershipService.removeDocumentSpaceDashboardMembers(documentSpaceId, [{
      id: 'test-user-id',
      email: 'test@dev.com',
      privileges: [
        {
          id: 'test-privilege-id',
          type: DocumentSpacePrivilegeDtoTypeEnum.Read
        }
      ]
    }]);

    await waitFor(() => expect(removeMemberApiSpy).toHaveBeenCalledTimes(1));
  });

  it('should remove app client members', async () => {
    const response = jest.fn(() => {
      return Promise.resolve(createAxiosSuccessResponse({}));
    });
    const removeMemberApiSpy = jest.spyOn(documentSpaceApi, 'removeAppClientFromDocumentSpace').mockImplementation(response);
    membershipService.removeDocumentSpaceAppClientMember(documentSpaceId, 'some id3');
    await waitFor(() => expect(removeMemberApiSpy).toHaveBeenCalledTimes(1));
  });

  it('should resolve Document Space Privileges to nice names', () => {
    expect(resolvePrivName(DocumentSpacePrivilegeDtoTypeEnum.Membership)).toEqual(DocumentSpacePrivilegeNiceName.ADMIN);
    expect(resolvePrivName(DocumentSpacePrivilegeDtoTypeEnum.Write)).toEqual(DocumentSpacePrivilegeNiceName.EDITOR);
    expect(resolvePrivName(DocumentSpacePrivilegeDtoTypeEnum.Read)).toEqual(DocumentSpacePrivilegeNiceName.VIEWER);
  });

  it('should resolve privilege nice names to Document Space Privileges', () => {
    expect(unResolvePrivName(DocumentSpacePrivilegeNiceName.ADMIN)).toEqual([
      DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Membership, DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Write
    ]);
    expect(unResolvePrivName(DocumentSpacePrivilegeNiceName.EDITOR)).toEqual([
      DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Write
    ]);
    expect(unResolvePrivName(DocumentSpacePrivilegeNiceName.VIEWER)).toEqual([]);
  });

  it('should get the highest privilege level for Document Space member', () => {
    expect(getHighestPrivForMember(members[0])).toEqual(DocumentSpacePrivilegeNiceName.ADMIN);
    expect(getHighestPrivForMember(members[1])).toEqual(DocumentSpacePrivilegeNiceName.VIEWER);
    expect(getHighestPrivForMember(members[2])).toEqual(DocumentSpacePrivilegeNiceName.EDITOR);
    expect(getHighestPrivForMember(undefined as any)).toEqual('');
  });

  it('should get list of app clients available to assign to a doc space', async () => {
    const response = jest.fn(() => {
      return Promise.resolve(createAxiosSuccessResponse<AppClientSummaryDtoResponseWrapper>({
        data: [{
          id: 'some appid',
          name: 'app10'
        }]
      }));
    });
    const spy = jest.spyOn(documentSpaceApi, 'getAppClientsForAssignmentToDocumentSpace').mockImplementation(response);
    await membershipService.getAvailableAppClientsForDocumentSpace('doc space');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should get list of app clients available to assign to a doc space on error', async () => {
    const response = jest.fn(() => {
      return Promise.reject(createGenericAxiosRequestErrorResponse(500));
    });
    jest.spyOn(documentSpaceApi, 'getAppClientsForAssignmentToDocumentSpace').mockImplementation(response);
    expect(membershipService.getAvailableAppClientsForDocumentSpace('doc space')).rejects.toEqual(createGenericAxiosRequestErrorResponse().response.data.reason);
  });

  it('should get list of app clients already assigned to a doc space', async () => {
    const response = jest.fn(() => {
      return Promise.resolve(createAxiosSuccessResponse<DocumentSpaceAppClientResponseDtoWrapper>({
        data: [{
          appClientId: 'some appid',
          appClientName: 'app10',
          privileges: [ DocumentSpaceAppClientResponseDtoPrivilegesEnum.Read ]
        }]
      }));
    });
    const spy = jest.spyOn(documentSpaceApi, 'getAppClientUsersForDocumentSpace').mockImplementation(response);
    await membershipService.getAssignedAppClientsForDocumentSpace('doc space');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should get list of app clients already assigned to a doc space on error', async () => {
    const response = jest.fn(() => {
      return Promise.reject(createGenericAxiosRequestErrorResponse(500));
    });
    jest.spyOn(documentSpaceApi, 'getAppClientUsersForDocumentSpace').mockImplementation(response);
    expect(membershipService.getAssignedAppClientsForDocumentSpace('doc space')).rejects.toEqual(createGenericAxiosRequestErrorResponse().response.data.reason);
  });
});

import { waitFor } from '@testing-library/dom';
import { AxiosResponse } from 'axios';
import { InfiniteScrollOptions } from '../../../components/DataCrudFormPage/infinite-scroll-options';
import {
  DocumentSpaceControllerApi,
  DocumentSpaceControllerApiInterface,
  DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum,
  DocumentSpaceDashboardMemberResponseDto,
  DocumentSpaceDashboardMemberResponseDtoResponseWrapper,
  DocumentSpacePrivilegeDtoTypeEnum
} from '../../../openapi';
import {
  createAxiosSuccessResponse,
  createGenericAxiosRequestErrorResponse,
} from '../../../utils/TestUtils/test-utils';
import DocumentSpaceMembershipService from '../document-space-membership-service';

describe('Test Document Space Membership Service', () => {
  const infiniteScrollOptions: InfiniteScrollOptions = {
    enabled: true,
    limit: 5,
  };

  const documentSpaceId = 'b8529a48-a61c-45a7-b0d1-2eb5d429d3bf';

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
    }
  ];

  const membersResponse: AxiosResponse<DocumentSpaceDashboardMemberResponseDtoResponseWrapper> = createAxiosSuccessResponse(
    {
      data: members
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
});

import {IDatasource, IGetRowsParams} from 'ag-grid-community';
import {InfiniteScrollOptions} from '../../../components/DataCrudFormPage/infinite-scroll-options';
import {convertAgGridSortToQueryParams, generateInfiniteScrollLimit} from '../../../components/Grid/GridUtils/grid-utils';
import {ToastType} from '../../../components/Toast/ToastUtils/toast-type';
import {createFailedDataFetchToast, createTextToast} from '../../../components/Toast/ToastUtils/ToastUtils';
import {
  AppClientSummaryDto,
  DocumentSpaceAppClientMemberRequestDto,
  DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum,
  DocumentSpaceAppClientResponseDto,
  DocumentSpaceControllerApiInterface,
  DocumentSpaceDashboardMemberRequestDto,
  DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum,
  DocumentSpaceDashboardMemberResponseDto,
  DocumentSpacePrivilegeDtoTypeEnum
} from '../../../openapi';
import {prepareRequestError} from '../../../utils/ErrorHandling/error-handling-utils';
import { DocumentSpacePrivilegeNiceName } from './document-space-privilege-nice-name';

export enum MemberTypeEnum {
  DASHBOARD_USER,
  APP_CLIENT
}

export default class DocumentSpaceMembershipService {
  constructor(
    public documentSpaceApi: DocumentSpaceControllerApiInterface) { }

  /** 
   * Creates a datasource for an ag-grid that contains either list of dashboard users (the default)
   * and their privileges, or a list of assigned app clients and their privileges
   * @param spaceId 
   * @param infiniteScrollOptions 
   * @param memberType either MemberTypeEnum.DASHBOARD_USER or MemberTypeEnum.APP_CLIENT
   * @returns 
   */
  createMembersDatasource(spaceId: string, 
    infiniteScrollOptions: InfiniteScrollOptions, 
    memberType: MemberTypeEnum = MemberTypeEnum.DASHBOARD_USER): IDatasource {
      
    const datasource: IDatasource = {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);

          const sort = convertAgGridSortToQueryParams(params.sortModel);

          let data: (DocumentSpaceDashboardMemberResponseDto | DocumentSpaceAppClientResponseDto)[];          
          if (memberType == MemberTypeEnum.DASHBOARD_USER) {
            data = (await this.documentSpaceApi.getDashboardUsersForDocumentSpace(spaceId, page, limit, sort)).data.data;
          } else {
            data = (await this.getAssignedAppClientsForDocumentSpace(spaceId))
          }

          let lastRow = -1;

          /**
           * If the request returns data with length of 0, then
           * there is no more data to be retrieved.
           *
           * If the request returns data with length less than the limit,
           * then that is the last page.
           */
          if (data.length == 0 || data.length < limit)
            lastRow = (page * limit) + data.length;

          params.successCallback(data, lastRow);
        } catch (err) {
          params.failCallback();

          /**
           * Don't error out the state here. If the request fails for some reason, just show nothing.
           *
           * Call the success callback as a hack to prevent
           * ag grid from showing an infinite loading state on failure.
           */
          params.successCallback([], 0);

          const requestErr = prepareRequestError(err);

          /**
           * Server responded with some other response
           */
          if (requestErr.status != null) {
            createFailedDataFetchToast();
            return;
          }

          /**
           * Something else went wrong... the request did not leave
           */
          createTextToast(ToastType.ERROR, requestErr.message, { autoClose: false });
          return;
        }
      }
    }

    return datasource;
  }

  /**
   * Adds a user to the document space with requested privileges
   * @param documentSpaceId 
   * @param dashboardMemberDto 
   * @returns 
   */
  async addDocumentSpaceMember(documentSpaceId: string, dashboardMemberDto: DocumentSpaceDashboardMemberRequestDto): Promise<void> {
    try {
      await this.documentSpaceApi.addUserToDocumentSpace(documentSpaceId, dashboardMemberDto);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  /**
   * Adds an App Client to a document space with given privs
   * @param documentSpaceId 
   * @param appClientMemberDto 
   * @returns 
   */
  async addDocumentSpaceAppClientMember(documentSpaceId: string, appClientMemberDto: DocumentSpaceAppClientMemberRequestDto): Promise<void> {
    try {
      await this.documentSpaceApi.addAppClientToDocumentSpace(documentSpaceId, appClientMemberDto);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  /**
   * Returns a list of App Clients that are assigned already to this given space (and their privileges)
   * @param documentSpaceId 
   * @returns 
   */
  async getAssignedAppClientsForDocumentSpace(documentSpaceId: string): Promise<DocumentSpaceAppClientResponseDto[]> {
    try {
      return (await this.documentSpaceApi.getAppClientUsersForDocumentSpace(documentSpaceId)).data.data;
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  /**
   * Returns a list of App Clients that are available to be assigned to this document space (excludes ones already assigned)
   * @param documentSpaceId 
   * @returns 
   */
  async getAvailableAppClientsForDocumentSpace(documentSpaceId: string): Promise<AppClientSummaryDto[]> {
    try {
      return (await this.documentSpaceApi.getAppClientsForAssignmentToDocumentSpace(documentSpaceId)).data.data;
    } catch (error) {
      return Promise.reject(prepareRequestError(error).message);
    }
  }

  /**
   * Removes a user(s) from the document space
   * @param documentSpaceId 
   * @param dashboardMemberDtos 
   * @returns 
   */
  removeDocumentSpaceDashboardMembers(documentSpaceId: string, dashboardMemberDtos: DocumentSpaceDashboardMemberResponseDto[]) {
    const emails = dashboardMemberDtos.map(memberDto => memberDto.email);
    return this.documentSpaceApi.removeUserFromDocumentSpace(documentSpaceId, emails);
  }

  /**
   * Removes an appclient (using its ID) from a document space completely
   * @param documentSpaceId 
   * @param appClientId 
   * @returns 
   */
  removeDocumentSpaceAppClientMember(documentSpaceId: string, appClientId: string) {
    return this.documentSpaceApi.removeAppClientFromDocumentSpace(documentSpaceId, appClientId);
  }

  batchAddUserToDocumentSpace(id: string, file?: any) {
    return this.documentSpaceApi.batchAddUserToDocumentSpace(id, file);
  }  
}

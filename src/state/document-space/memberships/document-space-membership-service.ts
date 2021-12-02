import {IDatasource, IGetRowsParams} from 'ag-grid-community';
import {InfiniteScrollOptions} from '../../../components/DataCrudFormPage/infinite-scroll-options';
import {convertAgGridSortToQueryParams, generateInfiniteScrollLimit} from '../../../components/Grid/GridUtils/grid-utils';
import {ToastType} from '../../../components/Toast/ToastUtils/toast-type';
import {createFailedDataFetchToast, createTextToast} from '../../../components/Toast/ToastUtils/ToastUtils';
import {
  DocumentSpaceControllerApiInterface,
  DocumentSpaceDashboardMemberRequestDto,
  DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum,
  DocumentSpaceDashboardMemberResponseDto,
  DocumentSpacePrivilegeDtoTypeEnum
} from '../../../openapi';
import {prepareRequestError} from '../../../utils/ErrorHandling/error-handling-utils';
import { DocumentSpacePrivilegeNiceName } from './document-space-privilege-nice-name';

export default class DocumentSpaceMembershipService {
  constructor(
    public documentSpaceApi: DocumentSpaceControllerApiInterface) { }

  createMembersDatasource(spaceId: string, infiniteScrollOptions: InfiniteScrollOptions): IDatasource {
    const datasource: IDatasource = {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);

          const sort = convertAgGridSortToQueryParams(params.sortModel);

          const data: DocumentSpaceDashboardMemberResponseDto[] = (await this.documentSpaceApi.getDashboardUsersForDocumentSpace(spaceId, page, limit, sort)).data.data;

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

  addDocumentSpaceMember(documentSpaceId: string, dashboardMemberDto: DocumentSpaceDashboardMemberRequestDto) {
    return this.documentSpaceApi.addUserToDocumentSpace(documentSpaceId, dashboardMemberDto);
  }

  removeDocumentSpaceDashboardMembers(documentSpaceId: string, dashboardMemberDtos: DocumentSpaceDashboardMemberResponseDto[]) {
    const emails = dashboardMemberDtos.map(memberDto => memberDto.email);

    return this.documentSpaceApi.removeUserFromDocumentSpace(documentSpaceId, emails);
  }

  batchAddUserToDocumentSpace(id: string, file?: any) {
    return this.documentSpaceApi.batchAddUserToDocumentSpace(id, file);
  }

  // converts backend priv names to friendlier names for UI/users per mocks
  resolvePrivName(privName: DocumentSpacePrivilegeDtoTypeEnum | string): string {
    if (privName === DocumentSpacePrivilegeDtoTypeEnum.Membership) {
      return DocumentSpacePrivilegeNiceName.ADMIN;
    } else if (privName === DocumentSpacePrivilegeDtoTypeEnum.Write) {
      return DocumentSpacePrivilegeNiceName.EDITOR;
    } else {
      return DocumentSpacePrivilegeNiceName.VIWER;
    }
  }

  // converts friendly priv names from the UI to the needed one(s) for the backend
  //  it also gives any of the "free" implicit ones that come with a higher privilege (e.g. ADMIN gives EDITOR AND VIEWER)
  unResolvePrivName(privilegeNiceName: DocumentSpacePrivilegeNiceName | string): DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum[] {
    if (privilegeNiceName === DocumentSpacePrivilegeNiceName.ADMIN) {
      return [ DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Membership, DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Write ];
    } else if (privilegeNiceName === DocumentSpacePrivilegeNiceName.EDITOR) {
      return [ DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Write ]
    } else {
      return [];
    }
  }

  // callback for the combobox renderer to decide what item is selected, go with highest priv if more than one..
  //  e.g. WRITE priv would result from a set containing [ READ, WRITE ]..
  getHighestPrivForMember(data: DocumentSpaceDashboardMemberResponseDto): string {
    if (!data) return '';

    if (data.privileges.find((item) => item.type === DocumentSpacePrivilegeDtoTypeEnum.Membership))
      return this.resolvePrivName(DocumentSpacePrivilegeDtoTypeEnum.Membership);
    else if (data.privileges.find((item) => item.type === DocumentSpacePrivilegeDtoTypeEnum.Write))
      return this.resolvePrivName(DocumentSpacePrivilegeDtoTypeEnum.Write);
    else return this.resolvePrivName(DocumentSpacePrivilegeDtoTypeEnum.Read);
  }
}

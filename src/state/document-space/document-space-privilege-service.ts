import { postpone, State } from '@hookstate/core';
import axios from 'axios';
import {
  DocumentSpaceControllerApiInterface,
  DocumentSpacePrivilegeDto,
  DocumentSpacePrivilegeDtoTypeEnum
} from '../../openapi';
import { CancellableDataRequest, makeCancellableDataRequest, makeCancellableDataRequestToken } from '../../utils/cancellable-data-request';
import { accessAuthorizedUserState } from '../authorized-user/authorized-user-state';
import { AbstractGlobalStateService } from '../global-service/abstract-global-state-service';
import { PrivilegeType } from '../privilege/privilege-type';

export default class DocumentSpacePrivilegeService extends AbstractGlobalStateService<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>> {
  constructor(
    private documentSpaceApi: DocumentSpaceControllerApiInterface,
    private documentSpacePrivilegeState: State<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>>
  ) {
    super(documentSpacePrivilegeState);
  }

  private authorizedUserService = accessAuthorizedUserState();

  private fetchDashboardUserPrivilegesRequest?: CancellableDataRequest<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>> = undefined;

  /**
   * Gets privileges for a dashboard user for a specific document space and
   * sets the state to it.
   * 
   * @param documentSpaceId the document space id to get privileges for
   * @returns returns the promise that was set
   */
  fetchAndStoreDashboardUserDocumentSpacePrivileges(documentSpaceId: string): CancellableDataRequest<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>> {
    // Only allow a single request to fetch spaces
    if (this.fetchDashboardUserPrivilegesRequest != null) {
      this.fetchDashboardUserPrivilegesRequest.cancelTokenSource.cancel();
    }

    const cancellableRequest = makeCancellableDataRequestToken(this.documentSpaceApi.getSelfDashboardUserPrivilegesForDocumentSpace.bind(this.documentSpaceApi, documentSpaceId));

    const privileges = cancellableRequest.axiosPromise()
      .then(response => {
        const data = response.data.data;
        const documentSpacePrivileges = this.convertDocumentSpacePrivilegesToRecord(data);

        const privilegeRecord: Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>> = {};
        privilegeRecord[documentSpaceId] = documentSpacePrivileges;

        return privilegeRecord;
      });

      const dataRequest = {
        promise: privileges,
        cancelTokenSource: cancellableRequest.cancelTokenSource
      };
  
      this.documentSpacePrivilegeState.batch(state => {
        if (state.promised) {
          return postpone;
        }
  
        this.fetchDashboardUserPrivilegesRequest = dataRequest;
        state.set(privileges);
      });
  
      return dataRequest;
  }

  /**
   * Gets privileges for a dashboard user for all of their authorized document spaces and
   * sets the state to it.
   *
   * This will always resolve, even if some or all of the requests failed
   * 
   * @param documentSpaceIds the document space ids that the user is authorized for
   * @returns the privileges of the user, separated by each document space
   */
  fetchAndStoreDashboardUserDocumentSpacesPrivileges(documentSpaceIds: Set<string>): CancellableDataRequest<Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>> {
    // Only allow a single request to fetch spaces
    if (this.fetchDashboardUserPrivilegesRequest != null) {
      this.fetchDashboardUserPrivilegesRequest.cancelTokenSource.cancel();
    }

    // Contains requests made to get privileges for each document space
    const requests: Promise<{ id: string, privileges: Record<DocumentSpacePrivilegeDtoTypeEnum, boolean> }>[] = [];

    // Cancel token used by all requests sent for privileges
    const cancelToken = axios.CancelToken.source();

    // Maps the index of a request to the document space id
    const requestToDocumentSpaceIdMap: Map<number, string> = new Map();

    documentSpaceIds.forEach(id => {
      const cancellableRequest = makeCancellableDataRequest(cancelToken, this.documentSpaceApi.getSelfDashboardUserPrivilegesForDocumentSpace.bind(this.documentSpaceApi, id));

      requests.push(
        cancellableRequest.axiosPromise()
          .then(response => {
            return {
              id,
              privileges: this.convertDocumentSpacePrivilegesToRecord(response.data.data)
            }
          })
      );
      requestToDocumentSpaceIdMap.set(requests.length - 1, id);
    });

    const allPrivileges = Promise.allSettled(requests)
      .then(data => {
        const privileges: Record<string, Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>> = {};

        data.forEach((privilegePromise, idx) => {
          const id = requestToDocumentSpaceIdMap.get(idx);
          if (id != null && privilegePromise.status === 'fulfilled') {
            privileges[privilegePromise.value.id] = privilegePromise.value.privileges;
          }
        });

        return privileges;
      });

    const dataRequest = {
      promise: allPrivileges,
      cancelTokenSource: cancelToken
    };

    this.documentSpacePrivilegeState.batch(state => {
      if (state.promised) {
        return postpone;
      }

      this.fetchDashboardUserPrivilegesRequest = dataRequest;
      state.set(allPrivileges);
    });


    return dataRequest;
  }

  convertDocumentSpacePrivilegesToRecord(privileges: DocumentSpacePrivilegeDto[]): Record<DocumentSpacePrivilegeDtoTypeEnum, boolean> {
    return Object.values(DocumentSpacePrivilegeDtoTypeEnum).reduce<Record<DocumentSpacePrivilegeDtoTypeEnum, boolean>>((prev, curr) => {
      prev[curr] = privileges?.find(privilege => privilege.type === curr) ? true : false;
      return prev;
    }, { READ: false, WRITE: false, MEMBERSHIP: false });
  }

  isAuthorizedForAction(documentSpaceId: string, actionType: DocumentSpacePrivilegeDtoTypeEnum) {
    if (this.authorizedUserService.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN)) {
      return true;
    }

    if (!this.isStateReady) {
      return false;
    }

    const privileges = this.documentSpacePrivilegeState.value[documentSpaceId];

    return privileges && privileges[actionType];
  }

  resetState() {
    if (!this.isPromised) {
      this.documentSpacePrivilegeState.set({});
    }

    // Cancel pending requests if necessary
    this.fetchDashboardUserPrivilegesRequest?.cancelTokenSource.cancel();
    this.fetchDashboardUserPrivilegesRequest = undefined;
  }
}

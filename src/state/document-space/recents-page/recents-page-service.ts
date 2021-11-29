import { Downgraded, State } from '@hookstate/core';
import { IDatasource, IGetRowsParams } from 'ag-grid-community';
import React, { MutableRefObject } from 'react';
import { InfiniteScrollOptions } from '../../../components/DataCrudFormPage/infinite-scroll-options';
import { generateInfiniteScrollLimit } from '../../../components/Grid/GridUtils/grid-utils';
import { ToastType } from '../../../components/Toast/ToastUtils/toast-type';
import { createFailedDataFetchToast, createTextToast } from '../../../components/Toast/ToastUtils/ToastUtils';
import {
  DocumentSpaceControllerApiInterface,
  DocumentSpacePrivilegeDtoTypeEnum,
  DocumentSpaceResponseDto,
  RecentDocumentDto
} from '../../../openapi';
import { performActionWhenMounted } from '../../../utils/component-utils';
import { prepareRequestError } from '../../../utils/ErrorHandling/error-handling-utils';
import AuthorizedUserService from '../../authorized-user/authorized-user-service';
import { AbstractGlobalStateService } from '../../global-service/abstract-global-state-service';
import { PrivilegeType } from '../../privilege/privilege-type';
import DocumentSpacePrivilegeService from '../document-space-privilege-service';
import DocumentSpaceService from '../document-space-service';
import { RecentsPageState } from './recents-page-state';

export default class RecentsPageService extends AbstractGlobalStateService<RecentsPageState> {
  constructor(
    private documentSpaceApi: DocumentSpaceControllerApiInterface,
    public recentsState: State<RecentsPageState>,
    private mountedRef: MutableRefObject<boolean>,
    private authorizedUserService: AuthorizedUserService,
    private documentSpaceService: DocumentSpaceService,
    private documentSpacePrivilegesService: DocumentSpacePrivilegeService
  ) {
    super(recentsState);
  }

  private createRecentDocumentsDatasource(infiniteScrollOptions: InfiniteScrollOptions): IDatasource {
    const datasource: IDatasource = {
      getRows: async (params: IGetRowsParams) => {
        try {
          const limit = generateInfiniteScrollLimit(infiniteScrollOptions);
          const page = Math.floor(params.startRow / limit);
          const data: RecentDocumentDto[] = (await this.documentSpaceApi.getRecentlyUploadedFilesByAuthenticatedUser(page, limit)).data.data;

          let lastRow = -1;

          /**
           * Last page, calculate the last row
           */
          if (data.length === 0 || data.length < limit) {
            lastRow = (page * limit) + data.length;
          }

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

  async fetchSpacesAndPrivileges(infiniteScrollOptions: InfiniteScrollOptions) {
    // Don't need to load Document Spaces and Privileges for DASHBOARD_ADMIN's
    // since they currently have access to everything
    if (this.authorizedUserService.authorizedUserHasPrivilege(PrivilegeType.DASHBOARD_ADMIN)) {
      performActionWhenMounted(this.mountedRef.current, () => this.recentsState.datasource.set(this.createRecentDocumentsDatasource(infiniteScrollOptions)));
      return;
    }
    
    performActionWhenMounted(this.mountedRef.current, () => this.recentsState.pageStatus.isLoading.set(true));

    let authorizedDocumentSpaces: DocumentSpaceResponseDto[] = []; 
    try {
      authorizedDocumentSpaces = await this.documentSpaceService.fetchAndStoreSpaces().promise;
    } catch (err) {
      const errorMessage = 'Failed to fetch your authorized Document Spaces';

      performActionWhenMounted(this.mountedRef.current, () => {
        this.recentsState.merge({
          pageStatus: {
            isLoading: false,
            isError: true,
            message: errorMessage
          }
        });

        createTextToast(ToastType.ERROR, errorMessage, { autoClose: false });
      });

      return;
    }

    try {
      await this.documentSpacePrivilegesService.fetchAndStoreDashboardUserDocumentSpacesPrivileges(new Set(authorizedDocumentSpaces.map(item => item.id))).promise;
    } catch (err) {
      performActionWhenMounted(this.mountedRef.current, () => 
        createTextToast(ToastType.ERROR, 'Could not load privileges for authorized Document Spaces. Actions will be limited', { autoClose: false }));
    }

    performActionWhenMounted(this.mountedRef.current, () => {
      this.recentsState.merge({
        pageStatus: {
          isLoading: false,
          isError: false,
          message: undefined
        },
        datasource: this.createRecentDocumentsDatasource(infiniteScrollOptions)
      });
    });
  }

  isSpacesOrPrivilegesLoading() {
    return this.recentsState.pageStatus.isLoading.value;
  }

  isAuthorizedForAction(recentDocumentDto: RecentDocumentDto, action: DocumentSpacePrivilegeDtoTypeEnum) {
    return recentDocumentDto != null && this.documentSpacePrivilegesService.isAuthorizedForAction(recentDocumentDto.documentSpace.id, action);
  }

  async deleteArchiveFile() {
    const file = this.recentsState.selectedFile.value;

    if (file == null) {
      throw new Error('File cannot be null for File Archive Deletion');
    }

    try {
      await this.documentSpaceService.deleteArchiveItemBySpaceAndParent(file.documentSpace.id, file.parentFolderId, file.key);
      performActionWhenMounted(this.mountedRef.current, () => createTextToast(ToastType.SUCCESS, 'File successfully archived: ' + file.key));
    } catch (error) {
      performActionWhenMounted(this.mountedRef.current, () => createTextToast(ToastType.ERROR, 'Could not delete requested file: ' + file.key));
    } finally {
      performActionWhenMounted(this.mountedRef.current, () => this.recentsState.merge({
        selectedFile: undefined,
        showDeleteDialog: false,
        shouldUpdateInfiniteCache: true
      }));
    }
  }

  async renameFile(newName: string) {
    const file = this.recentsState.selectedFile.attach(Downgraded).value;

    if (file == null) {
      throw new Error('File cannot be null for File Rename');
    }
    
    let wasSuccessful = false;

    try {
      performActionWhenMounted(this.mountedRef.current, () => this.recentsState.renameFormState.isSubmitting.set(true));
      
      const pathToFolderContainingFile = await this.documentSpaceService.getDocumentSpaceEntryPath(file.documentSpace.id, file.parentFolderId);
      await this.documentSpaceService.renameFile(file.documentSpace.id, pathToFolderContainingFile, file.key, newName);

      wasSuccessful = true;
      performActionWhenMounted(this.mountedRef.current, () => createTextToast(ToastType.SUCCESS, `Successfully renamed file ${file.key} to ${newName}`));
    } catch (error) {
      performActionWhenMounted(this.mountedRef.current, () => createTextToast(ToastType.ERROR, `Could not rename file ${file.key}`));
    } finally {
      performActionWhenMounted(this.mountedRef.current, () => {
        if (wasSuccessful) {
          this.recentsState.merge({
            shouldUpdateInfiniteCache: true,
            selectedFile: undefined,
            renameFormState: {
              isOpen: false,
              isSubmitting: false
            }
          });
        } else {
          this.recentsState.merge({
            selectedFile: undefined,
            renameFormState: {
              isOpen: false,
              isSubmitting: false
            }
          });
        }
      });
    }
  }

  resetState() {
    this.recentsState.set({
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

    this.documentSpaceService.resetState();
    this.documentSpacePrivilegesService.resetState();
  }
}

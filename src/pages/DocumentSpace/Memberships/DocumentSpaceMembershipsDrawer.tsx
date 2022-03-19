import { useHookstate } from '@hookstate/core';
import { cityTemperature } from '@visx/mock-data';
import { IDatasource, IGetRowsParams, _ } from 'ag-grid-community';
import React, { useEffect, useRef } from 'react';
import { InfiniteScrollOptions } from '../../../components/DataCrudFormPage/infinite-scroll-options';
import SuccessErrorMessage from '../../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import { SuccessErrorMessageProps } from '../../../components/forms/SuccessErrorMessage/SuccessErrorMessageProps';
import { SideDrawerSize } from '../../../components/SideDrawer/side-drawer-size';
import SideDrawer from '../../../components/SideDrawer/SideDrawer';
import TabBar from '../../../components/TabBar/TabBar';
import UserIconCircle from '../../../icons/UserIconCircle';
import {
  DocumentSpaceAppClientMemberRequestDto,
  DocumentSpaceAppClientResponseDto,
  DocumentSpaceDashboardMemberRequestDto,
  DocumentSpaceDashboardMemberResponseDto,
} from '../../../openapi';
import { documentSpaceMembershipService } from '../../../state/document-space/document-space-state';
import { MemberTypeEnum } from '../../../state/document-space/memberships/document-space-membership-service';
import BatchUserUploadDialog from './BatchUserUploadDialog';
import './DocumentSpaceMemberships.scss';
import DocumentSpaceMembershipsForm from './DocumentSpaceMembershipsForm';
import ManageDocumentSpaceAppClientMembers from './ManageMembershipSubForms/ManageDocumentSpaceAppClientMembers';
import ManageDocumentSpaceUserMembers from './ManageMembershipSubForms/ManageDocumentSpaceUserMembers';

export interface DocumentSpaceMembershipsState {
  datasourceState: {
    datasource?: IDatasource;
    shouldUpdateDatasource: boolean;
  };
  membersState: {
    selected: DocumentSpaceDashboardMemberResponseDto[];
    deletionState: {
      isConfirmationOpen: boolean;
    };
    membersToUpdate: DocumentSpaceDashboardMemberRequestDto[];
    submitting: boolean;
    memberUpdateSuccessMessage: string;
    memberUpdateFailMessage: string;
    showUpdateFailMessage: boolean;
    showUpdateSuccessMessage: boolean;
  };
  appClientsDatasourceState: {
    datasource?: IDatasource;
    shouldUpdateDatasource: boolean;
  };
  appClientMembersState: {
    selected: DocumentSpaceAppClientResponseDto[];
    deletionState: {
      isConfirmationOpen: boolean;
    };
    membersToUpdate: DocumentSpaceAppClientMemberRequestDto[];
    submitting: boolean;
    memberUpdateSuccessMessage: string;
    memberUpdateFailMessage: string;
    showUpdateFailMessage: boolean;
    showUpdateSuccessMessage: boolean;
  };
  selectedTab: number;
}

export interface BatchUploadState {
  successErrorState: SuccessErrorMessageProps;
}

export interface DocumentSpaceMembershipsProps {
  documentSpaceId: string;
  isOpen: boolean;
  onCloseHandler: () => void;
  onSubmit: () => void;
}

export const infiniteScrollOptions: InfiniteScrollOptions = {
  enabled: true,
  limit: 100,
};

function DocumentSpaceMembershipsDrawer(props: DocumentSpaceMembershipsProps) {
  const membershipService = documentSpaceMembershipService();
  const batchUploadState = useHookstate<BatchUploadState>({
    successErrorState: {
      successMessage: 'Successfully added members to Document Space',
      errorMessage: '',
      showSuccessMessage: false,
      showErrorMessage: false,
      showCloseButton: true,
    },
  });
  const pageState = useHookstate<DocumentSpaceMembershipsState>({
    datasourceState: {
      datasource: membershipService.createMembersDatasource(
        props.documentSpaceId, 
        infiniteScrollOptions,
        MemberTypeEnum.DASHBOARD_USER),
      shouldUpdateDatasource: true,
    },
    membersState: {
      selected: [],
      deletionState: {
        isConfirmationOpen: false,
      },
      membersToUpdate: [],
      submitting: false,
      memberUpdateSuccessMessage: '',
      memberUpdateFailMessage: '',
      showUpdateFailMessage: false,
      showUpdateSuccessMessage: true,
    },
    appClientsDatasourceState: {
      datasource: membershipService.createMembersDatasource(
        props.documentSpaceId, 
        infiniteScrollOptions,
        MemberTypeEnum.APP_CLIENT),
      shouldUpdateDatasource: true,
    },
    appClientMembersState: {
      selected: [],
      deletionState: {
        isConfirmationOpen: false,
      },
      membersToUpdate: [],
      submitting: false,
      memberUpdateSuccessMessage: '',
      memberUpdateFailMessage: '',
      showUpdateFailMessage: false,
      showUpdateSuccessMessage: false,
    },
    selectedTab: 0,
  });

  const mountedRef = useRef(false);
  
  useEffect(() => {
    mountedRef.current = true;
    pageState.merge({ selectedTab: 0 });
    return function cleanup() {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    resetBatchUploadState();
    pageState.merge({ selectedTab: 0 });
  }, [props.isOpen]);

  function onMemberChangeCallback(): void {
    pageState.datasourceState.shouldUpdateDatasource.set(true);
    pageState.appClientsDatasourceState.shouldUpdateDatasource.set(true);
  }

  function resetBatchUploadState() {
    batchUploadState.successErrorState.merge({
      successMessage: 'Successfully added members to Document Space',
      errorMessage: '',
      showSuccessMessage: false,
      showErrorMessage: false,
      showCloseButton: true,
    });
  }

  return (
    <SideDrawer
      size={SideDrawerSize.WIDE}
      titleStyle={{ color: '#5F96EA', marginTop: -2 }}
      preTitleNode={
        <div className="pre-title-icon">
          <UserIconCircle size={0} />
        </div>
      }
      postTitleNode={
        <BatchUserUploadDialog
          documentSpaceId={props.documentSpaceId}
          batchUploadState={batchUploadState}
          onFinish={onMemberChangeCallback}
        />
      }
      isLoading={false}
      title="Member Management"
      isOpen={props.isOpen}
      onCloseHandler={props.onCloseHandler}
    >
      <TabBar
        selectedIndex={pageState.selectedTab.get()}
        items={[
          {
            onClick: () => pageState.selectedTab.set(0),
            text: 'Add Member',
            content: (
              <React.Fragment>
                <SuccessErrorMessage
                  errorMessage={batchUploadState.successErrorState.errorMessage.value}
                  showErrorMessage={batchUploadState.successErrorState.showErrorMessage.value}
                  showSuccessMessage={batchUploadState.successErrorState.showSuccessMessage.value}
                  successMessage={batchUploadState.successErrorState.successMessage?.value}
                  showCloseButton={batchUploadState.successErrorState.showCloseButton.value}
                />
                <DocumentSpaceMembershipsForm
                  documentSpaceId={props.documentSpaceId}
                  onMemberChangeCallback={onMemberChangeCallback}
                  onCloseHandler={props.onCloseHandler}
                />
              </React.Fragment>
            ),
          },
          {
            onClick: () => {
              pageState.membersState.merge({ selected: [], memberUpdateSuccessMessage: '' });
              pageState.selectedTab.set(1);
            },
            text: 'Manage Members',
            content: (
              <ManageDocumentSpaceUserMembers
                documentSpaceId={props.documentSpaceId}
                onCloseHandler={props.onCloseHandler}
                onMemberChangeCallback={onMemberChangeCallback}
                pageState={pageState}
              />
            ),
          },
          {
            onClick: () => {
              pageState.appClientMembersState.merge({ selected: [], memberUpdateSuccessMessage: '' });
              pageState.selectedTab.set(2);
            },
            text: 'Manage App Clients',
            content: (
              <ManageDocumentSpaceAppClientMembers
                documentSpaceId={props.documentSpaceId}
                onCloseHandler={props.onCloseHandler}
                onMemberChangeCallback={onMemberChangeCallback}
                pageState={pageState}
              />
            ),
          },
        ]}
      />
    </SideDrawer>
  );
}

export default DocumentSpaceMembershipsDrawer;

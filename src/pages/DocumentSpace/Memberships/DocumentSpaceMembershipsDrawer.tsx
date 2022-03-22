import React, { useEffect, useRef } from 'react';
import SuccessErrorMessage from '../../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import { SideDrawerSize } from '../../../components/SideDrawer/side-drawer-size';
import SideDrawer from '../../../components/SideDrawer/SideDrawer';
import TabBar from '../../../components/TabBar/TabBar';
import UserIconCircle from '../../../icons/UserIconCircle';
import { useDocumentSpaceMembershipsPageState } from '../../../state/document-space/document-space-state';
import { MemberTypeEnum } from '../../../state/document-space/memberships/document-space-membership-service';
import BatchUserUploadDialog from './BatchUserUploadDialog';
import './DocumentSpaceMemberships.scss';
import DocumentSpaceMembershipsForm from './DocumentSpaceMembershipsForm';
import ManageDocumentSpaceAppClientMembers from './ManageMembershipSubForms/ManageDocumentSpaceAppClientMembers';
import ManageDocumentSpaceUserMembers from './ManageMembershipSubForms/ManageDocumentSpaceUserMembers';

export interface DocumentSpaceMembershipsProps {
  documentSpaceId: string;
  isOpen: boolean;
  onCloseHandler: () => void;
  onSubmit: () => void;
}


function DocumentSpaceMembershipsDrawer(props: DocumentSpaceMembershipsProps) {
  const pageState = useDocumentSpaceMembershipsPageState();

  useEffect(() => {
    pageState.membershipsPageState.merge({
      datasourceState: {
        datasource: pageState.membershipsService.createMembersDatasource(
          props.documentSpaceId,
          pageState.infiniteScrollOptions,
          MemberTypeEnum.DASHBOARD_USER
        ),
        shouldUpdateDatasource: true,
      },
      appClientsDatasourceState: {
        datasource: pageState.membershipsService.createMembersDatasource(
          props.documentSpaceId,
          pageState.infiniteScrollOptions,
          MemberTypeEnum.APP_CLIENT
        ),
        shouldUpdateDatasource: true,
      },

      selectedTab: 0,
    });
  }, []);

  useEffect(() => {
    pageState.resetBatchUploadState.bind(pageState)();
    pageState.membershipsPageState.merge({ selectedTab: 0 });
  }, [props.isOpen]);

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
          batchUploadState={pageState.batchUploadState}
          onFinish={pageState.onMemberChangeCallback.bind(pageState)}
        />
      }
      isLoading={false}
      title="Member Management"
      isOpen={props.isOpen}
      onCloseHandler={props.onCloseHandler}
    >
      <TabBar
        selectedIndex={pageState.membershipsPageState.selectedTab.get()}
        items={[
          {
            onClick: () => pageState.membershipsPageState.selectedTab.set(0),
            text: 'Add Member',
            content: (
              <React.Fragment>
                <SuccessErrorMessage
                  errorMessage={pageState.batchUploadState.successErrorState.errorMessage.value}
                  showErrorMessage={pageState.batchUploadState.successErrorState.showErrorMessage.value}
                  showSuccessMessage={pageState.batchUploadState.successErrorState.showSuccessMessage.value}
                  successMessage={pageState.batchUploadState.successErrorState.successMessage?.value}
                  showCloseButton={pageState.batchUploadState.successErrorState.showCloseButton.value}
                />
                <DocumentSpaceMembershipsForm
                  documentSpaceId={props.documentSpaceId}
                  onCloseHandler={props.onCloseHandler}
                />
              </React.Fragment>
            ),
          },
          {
            onClick: () => {
              pageState.membershipsPageState.membersState.merge({ selected: [], memberUpdateSuccessMessage: '' });
              pageState.membershipsPageState.selectedTab.set(1);
            },
            text: 'Manage Members',
            content: (
              <ManageDocumentSpaceUserMembers
                documentSpaceId={props.documentSpaceId}
                onCloseHandler={props.onCloseHandler}
              />
            ),
          },
          {
            onClick: () => {
              pageState.membershipsPageState.appClientMembersState.merge({ selected: [], memberUpdateSuccessMessage: '' });
              pageState.membershipsPageState.selectedTab.set(2);
            },
            text: 'Manage App Clients',
            content: (
              <ManageDocumentSpaceAppClientMembers
                documentSpaceId={props.documentSpaceId}
                onCloseHandler={props.onCloseHandler}
              />
            ),
          },
        ]}
      />
    </SideDrawer>
  );
}

export default DocumentSpaceMembershipsDrawer;

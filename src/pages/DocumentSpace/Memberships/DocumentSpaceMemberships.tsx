import { none, useHookstate } from '@hookstate/core';
import { IDatasource } from 'ag-grid-community';
import React, { FormEvent, useEffect, useRef } from 'react';
import Button from '../../../components/Button/Button';
import ComboBoxCellRenderer, {
  ComboBoxCellRendererProps
} from '../../../components/ComboBoxCellRenderer/ComboBoxCellRenderer';
import { InfiniteScrollOptions } from '../../../components/DataCrudFormPage/infinite-scroll-options';
import DeleteCellRenderer from '../../../components/DeleteCellRenderer/DeleteCellRenderer';
import Form from '../../../components/forms/Form/Form';
import SubmitActions from '../../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import { SuccessErrorMessageProps } from '../../../components/forms/SuccessErrorMessage/SuccessErrorMessageProps';
import { GridSelectionType } from '../../../components/Grid/grid-selection-type';
import GridColumn from '../../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../../components/Grid/GridUtils/grid-utils';
import InfiniteScrollGrid from '../../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import { SideDrawerSize } from '../../../components/SideDrawer/side-drawer-size';
import SideDrawer from '../../../components/SideDrawer/SideDrawer';
import TabBar from '../../../components/TabBar/TabBar';
import { ToastType } from '../../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../../components/Toast/ToastUtils/ToastUtils';
import RemoveIcon from '../../../icons/RemoveIcon';
import UserIconCircle from '../../../icons/UserIconCircle';
import { DocumentSpaceDashboardMemberRequestDto, DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum, DocumentSpaceDashboardMemberResponseDto, DocumentSpacePrivilegeDtoTypeEnum } from '../../../openapi';
import { FormActionType } from '../../../state/crud-page/form-action-type';
import { documentSpaceMembershipService } from '../../../state/document-space/document-space-state';
import { prepareRequestError } from '../../../utils/ErrorHandling/error-handling-utils';
import BatchUserUploadDialog from './BatchUserUploadDialog';
import './DocumentSpaceMemberships.scss';
import DocumentSpaceMembershipsDeleteConfirmation from './DocumentSpaceMembershipsDeleteConfirmation';
import DocumentSpaceMembershipsForm from './DocumentSpaceMembershipsForm';
import { DocumentSpaceMembershipsProps } from './DocumentSpaceMembershipsProps';

interface DocumentSpaceMembershipsState {
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
  selectedTab: number;
}

export interface BatchUploadState {
  successErrorState: SuccessErrorMessageProps;
}

export const ADMIN_PRIV_NAME = 'Admin';
export const EDITOR_PRIV_NAME = 'Editor';
export const VIEWER_PRIV_NAME = 'Viewer';

// converts backend priv names to friendlier names for UI/users per mocks
export function resolvePrivName(privName: string): string {
  if (privName === DocumentSpacePrivilegeDtoTypeEnum.Membership) {
    return ADMIN_PRIV_NAME;
  } else if (privName === DocumentSpacePrivilegeDtoTypeEnum.Write) {
    return EDITOR_PRIV_NAME;
  } else {
    return VIEWER_PRIV_NAME;
  }
}

// converts friendly priv names from the UI to the needed one(s) for the backend
//  it also gives any of the "free" implicit ones that come with a higher privilege (e.g. ADMIN gives EDITOR AND VIEWER)
export function unResolvePrivName(privName: string): DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum[] {
  if (privName === ADMIN_PRIV_NAME) {
    return [ DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Membership, DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Write ];
  } else if (privName === EDITOR_PRIV_NAME) {
    return [ DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum.Write ]
  } else {
    return [];
  }
}

const infiniteScrollOptions: InfiniteScrollOptions = {
  enabled: true,
  limit: 100,
};

const membershipColumns: GridColumn[] = [
  new GridColumn({
    field: 'email',
    headerName: 'Email',
    checkboxSelection: true,
    resizable: true,
    sortable: true,
  }),
];

function getDashboardMemberUniqueKey(data: DocumentSpaceDashboardMemberResponseDto): string {
  return data.id;
}

function DocumentSpaceMemberships(props: DocumentSpaceMembershipsProps) {
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
      datasource: undefined,
      shouldUpdateDatasource: false,
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
      showUpdateSuccessMessage: false,
    },
    selectedTab: 0
  });

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    pageState.merge({ selectedTab : 0 });
    return function cleanup() {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    resetMemberState();
    resetBatchUploadState();
    pageState.merge({ selectedTab : 0 });
  }, [props.isOpen]);

  useEffect(() => {
    pageState.merge({
      datasourceState: {
        datasource: membershipService.createMembersDatasource(props.documentSpaceId, infiniteScrollOptions),
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
        showUpdateSuccessMessage: false,
      },
    });
  }, [props.documentSpaceId]);

  function onDatasourceUpdateCallback(): void {
    pageState.datasourceState.merge({
      shouldUpdateDatasource: false,
    });
  }

  function onMemberChangeCallback(): void {
    pageState.datasourceState.shouldUpdateDatasource.set(true);
  }

  async function onMemberDeleteConfirmation() {
    try {
      await membershipService.removeDocumentSpaceDashboardMembers(
        props.documentSpaceId,
        pageState.membersState.selected.value
      );

      // Refresh the member list
      // Clean up state
      if (mountedRef.current) {
        onMemberChangeCallback();
        createTextToast(
          ToastType.SUCCESS,
          `Deleted (${pageState.membersState.selected.value.length}) Document Space Dashboard Users`
        );

        resetMemberState();
      }
    } catch (err) {
      const preparedError = prepareRequestError(err);

      if (mountedRef.current) {
        createTextToast(ToastType.ERROR, preparedError.message);
      }
    }
  }

  function resetMemberState() {
    pageState.membersState.merge({
      selected: [],
      deletionState: {
        isConfirmationOpen: false,
      },
    });
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

  function onMemberSelectionChange(
    data: DocumentSpaceDashboardMemberResponseDto,
    selectionEvent: GridSelectionType
  ): void {
    if (selectionEvent === 'selected') {
      addMemberToDeleteState(data);
    } else {
      removeMemberFromDeleteState(data.id);
    }
  }

  function addMemberToDeleteState(row: DocumentSpaceDashboardMemberResponseDto): void {
    if (
      pageState.membersState.selected.value &&
      !pageState.membersState.selected.value.find((i) => i.email === row.email)
    ) {
      pageState.membersState.selected.merge([row]);
    }
  }

  function removeMemberFromDeleteState(id: string): void {
    pageState.membersState.selected.find((member) => member.value.id === id)?.set(none);
  }

  // callback for the combobox renderer to decide what item is selected, go with highest priv if more than one..
  //  e.g. WRITE priv would result from a set containing [ READ, WRITE ]..
  function getHighestPrivForMember(data: DocumentSpaceDashboardMemberResponseDto): string {
    if (!data) return '';

    if (data.privileges.find((item) => item.type === DocumentSpacePrivilegeDtoTypeEnum.Membership))
      return resolvePrivName(DocumentSpacePrivilegeDtoTypeEnum.Membership);
    else if (data.privileges.find((item) => item.type === DocumentSpacePrivilegeDtoTypeEnum.Write))
      return resolvePrivName(DocumentSpacePrivilegeDtoTypeEnum.Write);
    else return resolvePrivName(DocumentSpacePrivilegeDtoTypeEnum.Read);
  }

  // for a given priv change from member-management list, add the changed user to membersToUpdateState
  function onMemberPrivilegeDropDownChanged(row: DocumentSpaceDashboardMemberResponseDto, item: string): void {
    if (!pageState.membersState.membersToUpdate.value.find((i) => i.email === row.email)) {
      pageState.membersState.membersToUpdate.merge([ { email: row.email, privileges: unResolvePrivName(item) }]);
    }
  }

  function deleteMemberRow(row: DocumentSpaceDashboardMemberResponseDto): void {
    addMemberToDeleteState(row);
    pageState.membersState.deletionState.isConfirmationOpen.set(true);
  }

  async function saveMembers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      pageState.membersState.merge({ submitting: true });
      for (const member of pageState.membersState.membersToUpdate.get()) {
        await membershipService.addDocumentSpaceMember(props.documentSpaceId, member);
      }

      pageState.membersState.merge({ 
        showUpdateFailMessage: false,
        showUpdateSuccessMessage: true, 
        memberUpdateSuccessMessage: 'Members Updated'});
    }
    catch (e) {
      pageState.membersState.merge({ 
        showUpdateSuccessMessage: false,
        showUpdateFailMessage: true,
        memberUpdateSuccessMessage: 'Error saving member permissions'});
    }

    pageState.membersState.merge({ submitting: false, membersToUpdate: [] });
  }

  function renderMembershipColumns(): GridColumn[] {
    return [
      ...membershipColumns,
      new GridColumn({
        valueGetter: GridColumn.defaultValueGetter,
        headerName: 'Permissions',
        cellRenderer: ComboBoxCellRenderer,
        cellRendererParams: {
          items: Object.values(DocumentSpacePrivilegeDtoTypeEnum).map(item => resolvePrivName(item)),
          onChange: onMemberPrivilegeDropDownChanged,
          selectedItem: getHighestPrivForMember,
        } as ComboBoxCellRendererProps,
      }),
      new GridColumn({
        valueGetter: GridColumn.defaultValueGetter,
        headerName: 'Remove',
        cellRenderer: DeleteCellRenderer,
        cellRendererParams: {
          onClick: deleteMemberRow,
        },
      }),
    ];
  }


  return (
    <SideDrawer
      size={SideDrawerSize.WIDE}
      titleStyle={{ color: '#5F96EA', marginTop: -2 }}
      preTitleNode={
        <div className='pre-title-icon'>
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
            onClick: () => { pageState.membersState.selected.set([]); pageState.selectedTab.set(1); },
            text: 'Manage Members',
            content: (
                pageState.datasourceState.datasource.value && (
                  <Form onSubmit={saveMembers} className="edit-members-form">
                    <div className="document-space-members">                           
                      <div className="document-space-members__header">
                        <h4 className="header__title">Assigned Members</h4>
                        {
                          <div className="header__actions">
                            <Button
                              disableMobileFullWidth
                              type={'button'}
                              disabled={pageState.membersState.selected.value.length === 0}
                              onClick={() => pageState.membersState.deletionState.isConfirmationOpen.set(true)}
                              unstyled
                              transparentOnDisabled
                              className={`${pageState.membersState.selected.value.length === 0 ? 'actions__remove-button-hidden' : ''}`}
                            >
                              <RemoveIcon
                                iconTitle="Remove Selected Members"
                                disabled={pageState.membersState.selected.value.length === 0}
                                size={1.5}                              
                              />
                              Remove Selected
                            </Button>
                          </div>
                        } 
                      </div>
                      <InfiniteScrollGrid
                        columns={renderMembershipColumns()}
                        datasource={pageState.datasourceState.datasource.value}
                        cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
                        maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
                        maxConcurrentDatasourceRequests={infiniteScrollOptions.maxConcurrentDatasourceRequests}
                        suppressCellSelection
                        updateDatasource={pageState.datasourceState.shouldUpdateDatasource.value}
                        updateDatasourceCallback={onDatasourceUpdateCallback}
                        getRowNodeId={getDashboardMemberUniqueKey}
                        rowSelection="multiple"
                        onRowSelected={onMemberSelectionChange}
                      />
                      <SuccessErrorMessage
                        errorMessage={pageState.membersState.memberUpdateFailMessage.value}
                        showErrorMessage={pageState.membersState.showUpdateFailMessage.value}
                        showSuccessMessage={pageState.membersState.showUpdateSuccessMessage.value}
                        successMessage={pageState.membersState.memberUpdateSuccessMessage.value}
                        showCloseButton={true}
                      />
                      <SubmitActions
                        onCancel={props.onCloseHandler}
                        cancelButtonLabel="Close"
                        formActionType={FormActionType.UPDATE}
                        isFormValid={true}
                        isFormModified={pageState.membersState.membersToUpdate.length > 0}
                        isFormSubmitting={pageState.membersState.submitting.value}
                      />
                    </div>
                    <DocumentSpaceMembershipsDeleteConfirmation
                      onMemberDeleteConfirmationSubmit={onMemberDeleteConfirmation}
                      onCancel={() => pageState.membersState.deletionState.isConfirmationOpen.set(false)}
                      show={pageState.membersState.deletionState.isConfirmationOpen.value}
                      selectedMemberCount={pageState.membersState.selected.value.length}
                    />
                </Form>)
            ),
          },
        ]}
      />
    </SideDrawer>
  );
}

export default DocumentSpaceMemberships;

import { Downgraded, none, State } from '@hookstate/core';
import { FormEvent, useEffect, useRef } from 'react';
import Button from '../../../../components/Button/Button';
import ComboBoxCellRenderer, {
  ComboBoxCellRendererProps,
} from '../../../../components/ComboBoxCellRenderer/ComboBoxCellRenderer';
import { InfiniteScrollOptions } from '../../../../components/DataCrudFormPage/infinite-scroll-options';
import DeleteCellRenderer from '../../../../components/DeleteCellRenderer/DeleteCellRenderer';
import Form from '../../../../components/forms/Form/Form';
import SubmitActions from '../../../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import FullPageInfiniteGrid from '../../../../components/Grid/FullPageInifiniteGrid/FullPageInfiniteGrid';
import { GridSelectionType } from '../../../../components/Grid/grid-selection-type';
import GridColumn from '../../../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../../../components/Grid/GridUtils/grid-utils';
import Spinner from '../../../../components/Spinner/Spinner';
import { ToastType } from '../../../../components/Toast/ToastUtils/toast-type';
import { createTextToast } from '../../../../components/Toast/ToastUtils/ToastUtils';
import RemoveIcon from '../../../../icons/RemoveIcon';
import {
  DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum,
  DocumentSpaceDashboardMemberResponseDto,
  DocumentSpacePrivilegeDtoTypeEnum,
} from '../../../../openapi';
import { FormActionType } from '../../../../state/crud-page/form-action-type';
import { documentSpaceMembershipService } from '../../../../state/document-space/document-space-state';
import { MemberTypeEnum } from '../../../../state/document-space/memberships/document-space-membership-service';
import { prepareRequestError } from '../../../../utils/ErrorHandling/error-handling-utils';
import DocumentSpaceMembershipsDeleteConfirmation from '../DocumentSpaceMembershipsDeleteConfirmation';
import { DocumentSpaceMembershipsState, infiniteScrollOptions } from '../DocumentSpaceMembershipsDrawer';

export interface ManageDocumentSpaceUserMembersProps {
  documentSpaceId: string;
  onMemberChangeCallback: () => void;
  pageState: State<DocumentSpaceMembershipsState>;
  onCloseHandler: () => void;
}

const membershipColumns: GridColumn[] = [
  new GridColumn({
    field: 'email',
    headerName: 'Email',
    checkboxSelection: true,
    resizable: true,
    sortable: true,
  }),
];

export default function ManageDocumentSpaceUserMembers(props: ManageDocumentSpaceUserMembersProps) {
  const membershipService = documentSpaceMembershipService();

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return function cleanup() {
      resetMemberState();
      mountedRef.current = false;
    };
  }, []);

  
  function getDashboardMemberUniqueKey(data: DocumentSpaceDashboardMemberResponseDto): string {
    return data.id;
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

  function onDatasourceUpdateCallback(): void {
    props.pageState.datasourceState.merge({
      shouldUpdateDatasource: false,
    });
  }

  function resetMemberState() {
    props.pageState.membersState.merge({
      selected: [],
      deletionState: {
        isConfirmationOpen: false,
      },
    });
  }

  async function onMemberDeleteConfirmation() {
    try {
      await membershipService.removeDocumentSpaceDashboardMembers(
        props.documentSpaceId,
        props.pageState.membersState.selected.value
      );

      // Refresh the member list
      // Clean up state
      if (mountedRef.current) {
        props.onMemberChangeCallback();
        createTextToast(
          ToastType.SUCCESS,
          `Deleted (${props.pageState.membersState.selected.value.length}) Document Space Dashboard Users`
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

  function addMemberToDeleteState(row: DocumentSpaceDashboardMemberResponseDto): void {
    if (
      props.pageState.membersState.selected.value &&
      !props.pageState.membersState.selected.value.find((i) => i.email === row.email)
    ) {
      props.pageState.membersState.selected.merge([row]);
    }
  }

  function removeMemberFromDeleteState(id: string): void {
    props.pageState.membersState.selected.find((member) => member.value.id === id)?.set(none);
  }

  // for a given priv change from member-management list, add the changed user to membersToUpdateState
  function onMemberPrivilegeDropDownChanged(row: DocumentSpaceDashboardMemberResponseDto, item: string): void {
    const memberUpdateIndex = props.pageState.membersState.membersToUpdate.value.findIndex(
      (i) => i.email === row.email
    );
    if (memberUpdateIndex === -1) {
      props.pageState.membersState.membersToUpdate.merge([
        {
          email: row.email,
          privileges: membershipService.unResolvePrivName(
            item
          ) as DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum[],
        },
      ]);
    } else {
      // we've already staged this member for an update, so update existing pending-update
      props.pageState.membersState.membersToUpdate[memberUpdateIndex].set({
        email: row.email,
        privileges: membershipService.unResolvePrivName(item) as DocumentSpaceDashboardMemberRequestDtoPrivilegesEnum[],
      });
    }
  }

  function deleteMemberRow(row: DocumentSpaceDashboardMemberResponseDto): void {
    addMemberToDeleteState(row);
    props.pageState.membersState.deletionState.isConfirmationOpen.set(true);
  }

  async function saveMembers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      props.pageState.membersState.merge({ submitting: true });
      for (const member of props.pageState.membersState.membersToUpdate.get()) {
        await membershipService.addDocumentSpaceMember(props.documentSpaceId, member);
      }

      props.pageState.membersState.merge({
        showUpdateFailMessage: false,
        showUpdateSuccessMessage: true,
        memberUpdateSuccessMessage: 'Members Updated',
      });
    } catch (e) {
      props.pageState.membersState.merge({
        showUpdateSuccessMessage: false,
        showUpdateFailMessage: true,
        memberUpdateSuccessMessage: 'Error saving member permissions',
      });
    }

    props.pageState.membersState.merge({ submitting: false, membersToUpdate: [] });
  }

  function renderMembershipColumns(): GridColumn[] {
    return [
      ...membershipColumns,
      new GridColumn({
        valueGetter: GridColumn.defaultValueGetter,
        headerName: 'Permissions',
        cellRenderer: ComboBoxCellRenderer,
        cellRendererParams: {
          items: Object.values(DocumentSpacePrivilegeDtoTypeEnum).map((item) =>
            membershipService.resolvePrivName(item)
          ),
          onChange: onMemberPrivilegeDropDownChanged,
          selectedItem: membershipService.getHighestPrivForMember.bind(membershipService),
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
    <Form onSubmit={saveMembers} className="edit-members-form">
      <div className="document-space-members">
        <div className="document-space-members__header">
          <h4 className="header__title">Assigned Members</h4>
          {
            <div className="header__actions">
              <Button
                disableMobileFullWidth
                type={'button'}
                disabled={props.pageState.membersState.selected.value.length === 0}
                onClick={() => props.pageState.membersState.deletionState.isConfirmationOpen.set(true)}
                unstyled
                transparentOnDisabled
                className={`${
                  props.pageState.membersState.selected.value.length === 0 ? 'actions__remove-button-hidden' : ''
                }`}
              >
                <RemoveIcon
                  iconTitle="Remove Selected Members"
                  disabled={props.pageState.membersState.selected.value.length === 0}
                  size={1.5}
                />
                Remove Selected
              </Button>
            </div>
          }
        </div>
        {(props.pageState.datasourceState.datasource.value && (
          <FullPageInfiniteGrid
            columns={renderMembershipColumns()}
            datasource={props.pageState.datasourceState.datasource.value}
            cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
            maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
            maxConcurrentDatasourceRequests={infiniteScrollOptions.maxConcurrentDatasourceRequests}
            suppressCellSelection
            updateDatasource={props.pageState.datasourceState.shouldUpdateDatasource.value}
            updateDatasourceCallback={onDatasourceUpdateCallback}
            getRowNodeId={getDashboardMemberUniqueKey}
            rowSelection="multiple"
            onRowSelected={onMemberSelectionChange}
            suppressRowClickSelection
          />
        )) || <Spinner />}
        <SuccessErrorMessage
          errorMessage={props.pageState.membersState.memberUpdateFailMessage.value}
          showErrorMessage={props.pageState.membersState.showUpdateFailMessage.value}
          showSuccessMessage={props.pageState.membersState.showUpdateSuccessMessage.value}
          successMessage={props.pageState.membersState.memberUpdateSuccessMessage.value}
          showCloseButton={true}
        />
        <SubmitActions
          onCancel={props.onCloseHandler}
          cancelButtonLabel="Close"
          formActionType={FormActionType.UPDATE}
          isFormValid={true}
          isFormModified={props.pageState.membersState.membersToUpdate.length > 0}
          isFormSubmitting={props.pageState.membersState.submitting.value}
        />
      </div>
      <DocumentSpaceMembershipsDeleteConfirmation
        onMemberDeleteConfirmationSubmit={onMemberDeleteConfirmation}
        onCancel={() => props.pageState.membersState.deletionState.isConfirmationOpen.set(false)}
        show={props.pageState.membersState.deletionState.isConfirmationOpen.value}
        selectedMemberCount={props.pageState.membersState.selected.value.length}
      />
    </Form>
  );
}

import { none, State } from '@hookstate/core';
import { FormEvent, useEffect, useRef } from 'react';
import Button from '../../../../components/Button/Button';
import ComboBoxCellRenderer, {
  ComboBoxCellRendererProps
} from '../../../../components/ComboBoxCellRenderer/ComboBoxCellRenderer';
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
  DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum,
  DocumentSpaceAppClientResponseDto,
  DocumentSpacePrivilegeDtoTypeEnum
} from '../../../../openapi';
import { FormActionType } from '../../../../state/crud-page/form-action-type';
import { documentSpaceMembershipService } from '../../../../state/document-space/document-space-state';
import { prepareRequestError } from '../../../../utils/ErrorHandling/error-handling-utils';
import DocumentSpaceMembershipsDeleteConfirmation from '../DocumentSpaceMembershipsDeleteConfirmation';
import { DocumentSpaceMembershipsState, infiniteScrollOptions } from '../DocumentSpaceMembershipsDrawer';

export interface ManageDocumentAppClientMembersProps {
  documentSpaceId: string;
  onMemberChangeCallback: () => void;
  pageState: State<DocumentSpaceMembershipsState>;
  onCloseHandler: () => void;
}

const membershipColumns: GridColumn[] = [
  new GridColumn({
    field: 'appClientName',
    headerName: 'App',
    checkboxSelection: true,
    resizable: true,
    sortable: true,
  }),
];

export default function ManageDocumentSpaceAppClientMembers(props: ManageDocumentAppClientMembersProps) {
  const membershipService = documentSpaceMembershipService();

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return function cleanup() {
      resetMemberState();
      mountedRef.current = false;
    };
  }, []);

  function getAppClientMemberUniqueKey(data: DocumentSpaceAppClientResponseDto): string {
    return data.appClientId;
  }

  function onMemberSelectionChange(data: DocumentSpaceAppClientResponseDto, selectionEvent: GridSelectionType): void {
    if (selectionEvent === 'selected') {
      addMemberToDeleteState(data);
    } else {
      removeMemberFromDeleteState(data.appClientId);
    }
  }

  function onDatasourceUpdateCallback(): void {
    props.pageState.appClientsDatasourceState.merge({
      shouldUpdateDatasource: false,
    });
  }

  function resetMemberState() {
    props.pageState.appClientMembersState.merge({
      selected: [],
      deletionState: {
        isConfirmationOpen: false,
      },
    });
  }

  async function onMemberDeleteConfirmation() {
    try {
      // remove each selected app client
      for (const client of props.pageState.appClientMembersState.selected.value) {
        await membershipService.removeDocumentSpaceAppClientMember(props.documentSpaceId, client.appClientId);
      }

      // Refresh the member list
      // Clean up state
      if (mountedRef.current) {
        props.onMemberChangeCallback();
        createTextToast(
          ToastType.SUCCESS,
          `Deleted (${props.pageState.appClientMembersState.selected.value.length}) App Client from Document Space`
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

  function addMemberToDeleteState(row: DocumentSpaceAppClientResponseDto): void {
    if (
      props.pageState.appClientMembersState.selected.value &&
      !props.pageState.appClientMembersState.selected.value.find((i) => i.appClientId === row.appClientId)
    ) {
      props.pageState.appClientMembersState.selected.merge([row]);
    }
  }

  function removeMemberFromDeleteState(id: string): void {
    props.pageState.appClientMembersState.selected.find((member) => member.value.appClientId === id)?.set(none);
  }

  // for a given priv change from app client member-management list, add the changed appClient to membersToUpdateState
  function onMemberPrivilegeDropDownChanged(row: DocumentSpaceAppClientResponseDto, item: string): void {
    console.log(props.pageState.appClientMembersState.membersToUpdate);
    const memberUpdateIndex = props.pageState.appClientMembersState.membersToUpdate.value.findIndex(
      (i) => i.appClientId === row.appClientId
    );
    if (memberUpdateIndex === -1) {
      props.pageState.appClientMembersState.membersToUpdate.merge([
        {
          appClientId: row.appClientId,
          privileges: membershipService.unResolvePrivName(
            item
          ) as DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum[],
        },
      ]);
    } else {
      // we've already staged this member for an update, so update existing pending-update
      props.pageState.appClientMembersState.membersToUpdate[memberUpdateIndex].set({
        appClientId: row.appClientId,
        privileges: membershipService.unResolvePrivName(item) as DocumentSpaceAppClientMemberRequestDtoPrivilegesEnum[],
      });
    }
  }

  function deleteMemberRow(row: DocumentSpaceAppClientResponseDto): void {
    addMemberToDeleteState(row);
    props.pageState.appClientMembersState.deletionState.isConfirmationOpen.set(true);
  }

  async function saveMembers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      props.pageState.appClientMembersState.merge({ submitting: true });
      for (const member of props.pageState.appClientMembersState.membersToUpdate.get()) {
        await membershipService.addDocumentSpaceAppClientMember(props.documentSpaceId, member);
      }

      props.pageState.appClientMembersState.merge({
        showUpdateFailMessage: false,
        showUpdateSuccessMessage: true,
        memberUpdateSuccessMessage: 'App Client Members Updated',
      });
      
    } catch (e) {
      props.pageState.appClientMembersState.merge({
        showUpdateSuccessMessage: false,
        showUpdateFailMessage: true,
        memberUpdateSuccessMessage: 'Error saving App Client member permissions',
      });
    }

    props.onMemberChangeCallback();
    props.pageState.appClientMembersState.merge({ submitting: false, membersToUpdate: [] });
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
          selectedItem: membershipService.getHighestPrivForAppCLientMember.bind(membershipService),
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
          <h4 className="header__title">Assigned App Clients</h4>
          {
            <div className="header__actions">
              <Button
                disableMobileFullWidth
                type={'button'}
                disabled={props.pageState.appClientMembersState.selected.value.length === 0}
                onClick={() => props.pageState.appClientMembersState.deletionState.isConfirmationOpen.set(true)}
                unstyled
                transparentOnDisabled
                className={`${
                  props.pageState.appClientMembersState.selected.value.length === 0
                    ? 'actions__remove-button-hidden'
                    : ''
                }`}
              >
                <RemoveIcon
                  iconTitle="Remove Selected App Client Members"
                  disabled={props.pageState.appClientMembersState.selected.value.length === 0}
                  size={1.5}
                />
                Remove Selected App Clients
              </Button>
            </div>
          }
        </div>
        {(props.pageState.appClientsDatasourceState.datasource.value && (
          <FullPageInfiniteGrid
            columns={renderMembershipColumns()}
            datasource={props.pageState.appClientsDatasourceState.datasource.value}
            cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
            maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
            maxConcurrentDatasourceRequests={infiniteScrollOptions.maxConcurrentDatasourceRequests}
            suppressCellSelection
            updateDatasource={props.pageState.appClientsDatasourceState.shouldUpdateDatasource.value}
            updateDatasourceCallback={onDatasourceUpdateCallback}
            getRowNodeId={getAppClientMemberUniqueKey}
            rowSelection="multiple"
            onRowSelected={onMemberSelectionChange}
            suppressRowClickSelection
          />
        )) || <Spinner />}
        <SuccessErrorMessage
          errorMessage={props.pageState.appClientMembersState.memberUpdateFailMessage.value}
          showErrorMessage={props.pageState.appClientMembersState.showUpdateFailMessage.value}
          showSuccessMessage={props.pageState.appClientMembersState.showUpdateSuccessMessage.value}
          successMessage={props.pageState.appClientMembersState.memberUpdateSuccessMessage.value}
          showCloseButton={true}
        />
        <SubmitActions
          onCancel={props.onCloseHandler}
          cancelButtonLabel="Close"
          formActionType={FormActionType.UPDATE}
          submitButtonLabel="Save"
          isFormValid={true}
          isFormModified={props.pageState.appClientMembersState.membersToUpdate.length > 0}
          isFormSubmitting={props.pageState.appClientMembersState.submitting.value}
        />
      </div>
      <DocumentSpaceMembershipsDeleteConfirmation
        onMemberDeleteConfirmationSubmit={onMemberDeleteConfirmation}
        onCancel={() => props.pageState.appClientMembersState.deletionState.isConfirmationOpen.set(false)}
        show={props.pageState.appClientMembersState.deletionState.isConfirmationOpen.value}
        selectedMemberCount={props.pageState.appClientMembersState.selected.value.length}
      />
    </Form>
  );
}

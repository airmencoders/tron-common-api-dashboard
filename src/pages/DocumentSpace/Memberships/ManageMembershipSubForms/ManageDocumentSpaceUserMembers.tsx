import { useEffect, useRef } from 'react';
import Button from '../../../../components/Button/Button';
import ComboBoxCellRenderer, { ComboBoxCellRendererProps } from '../../../../components/ComboBoxCellRenderer/ComboBoxCellRenderer';
import DeleteCellRenderer from '../../../../components/DeleteCellRenderer/DeleteCellRenderer';
import Form from '../../../../components/forms/Form/Form';
import SubmitActions from '../../../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import FullPageInfiniteGrid from '../../../../components/Grid/FullPageInifiniteGrid/FullPageInfiniteGrid';
import GridColumn from '../../../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../../../components/Grid/GridUtils/grid-utils';
import Spinner from '../../../../components/Spinner/Spinner';
import RemoveIcon from '../../../../icons/RemoveIcon';
import { DocumentSpaceDashboardMemberResponseDto, DocumentSpacePrivilegeDtoTypeEnum } from '../../../../openapi';
import { FormActionType } from '../../../../state/crud-page/form-action-type';
import { useDocumentSpaceMembershipsPageState } from '../../../../state/document-space/document-space-state';
import { getHighestPrivForMember, resolvePrivName } from '../../../../utils/document-space-utils';
import '../DocumentSpaceMemberships.scss';
import DocumentSpaceMembershipsDeleteConfirmation from '../DocumentSpaceMembershipsDeleteConfirmation';

export interface ManageDocumentSpaceUserMembersProps {
  documentSpaceId: string;
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
  const pageState = useDocumentSpaceMembershipsPageState();

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return function cleanup() {
      pageState.resetState.bind(pageState);
      mountedRef.current = false;
    };
  }, []);

  
  function renderMembershipColumns(): GridColumn[] {
    return [
      ...membershipColumns,
      new GridColumn({
        valueGetter: GridColumn.defaultValueGetter,
        headerName: 'Permissions',
        cellRenderer: ComboBoxCellRenderer,
        cellRendererParams: {
          items: Object.values(DocumentSpacePrivilegeDtoTypeEnum).map((item) => resolvePrivName(item)),
          onChange: (row: DocumentSpaceDashboardMemberResponseDto, item: string) => pageState.onMemberPrivilegeDropDownChanged.bind(pageState, row, item)(),
          selectedItem: getHighestPrivForMember
        } as ComboBoxCellRendererProps,
      }),
      new GridColumn({
        valueGetter: GridColumn.defaultValueGetter,
        headerName: 'Remove',
        cellRenderer: DeleteCellRenderer,
        cellRendererParams: {
        onClick: (row: DocumentSpaceDashboardMemberResponseDto) => pageState.deleteMemberRow.bind(pageState, row)()
        },
      }),
    ];
  }
  
  function getDashboardMemberUniqueKey(data: DocumentSpaceDashboardMemberResponseDto): string {
    return data.id;
  }

  return (
    <Form onSubmit={(event) => pageState.saveMembers.bind(pageState, props.documentSpaceId, event)()}className="edit-members-form">
      <div className="document-space-members">
        <div className="document-space-members__header">
          <h4 className="header__title">Assigned Members</h4>
          {
            <div className="header__actions">
              <Button
                disableMobileFullWidth
                type={'button'}
                disabled={pageState.membershipsPageState.membersState.selected.value.length <= 1}
                onClick={() => pageState.membershipsPageState.membersState.deletionState.isConfirmationOpen.set(true)}
                unstyled
                transparentOnDisabled
                className={`${
                  pageState.membershipsPageState.membersState.selected.value.length <= 1 ? 'actions__remove-button-hidden' : ''
                }`}
              >
                <RemoveIcon
                  iconTitle="Remove Selected Members"
                  disabled={pageState.membershipsPageState.membersState.selected.value.length <= 0}
                  size={1.5}
                  className={`${
                    pageState.membershipsPageState.membersState.selected.value.length <= 1 ? 'actions__remove-button-hidden' : ''
                  }`}
                />
                Remove Selected
              </Button>
            </div>
          }
        </div>
        {(pageState.membershipsPageState.datasourceState.datasource.value && (
          <FullPageInfiniteGrid
            columns={renderMembershipColumns()}
            datasource={pageState.membershipsPageState.datasourceState.datasource.value}
            cacheBlockSize={generateInfiniteScrollLimit(pageState.infiniteScrollOptions)}
            maxBlocksInCache={pageState.infiniteScrollOptions.maxBlocksInCache}
            maxConcurrentDatasourceRequests={pageState.infiniteScrollOptions.maxConcurrentDatasourceRequests}
            suppressCellSelection
            updateDatasource={pageState.membershipsPageState.datasourceState.shouldUpdateDatasource.value}
            updateDatasourceCallback={pageState.onDatasourceUpdateCallback.bind(pageState)}
            getRowNodeId={getDashboardMemberUniqueKey}
            rowSelection="multiple"
            onRowSelected={pageState.onMemberSelectionChange.bind(pageState)}
            suppressRowClickSelection
          />
        )) || <Spinner />}
        <SuccessErrorMessage
          errorMessage={pageState.membershipsPageState.membersState.memberUpdateFailMessage.value}
          showErrorMessage={pageState.membershipsPageState.membersState.showUpdateFailMessage.value}
          showSuccessMessage={pageState.membershipsPageState.membersState.showUpdateSuccessMessage.value}
          successMessage={pageState.membershipsPageState.membersState.memberUpdateSuccessMessage.value}
          showCloseButton={true}
        />
        <SubmitActions
          onCancel={props.onCloseHandler}
          cancelButtonLabel="Close"
          formActionType={FormActionType.UPDATE}
          isFormValid={true}
          isFormModified={pageState.membershipsPageState.membersState.membersToUpdate.length > 0}
          isFormSubmitting={pageState.membershipsPageState.membersState.submitting.value}
        />
      </div>
      <DocumentSpaceMembershipsDeleteConfirmation
        onMemberDeleteConfirmationSubmit={pageState.onMemberDeleteConfirmation.bind(pageState, props.documentSpaceId, mountedRef.current)}
        onCancel={() => pageState.membershipsPageState.membersState.deletionState.isConfirmationOpen.set(false)}
        show={pageState.membershipsPageState.membersState.deletionState.isConfirmationOpen.value}
        selectedMemberCount={pageState.membershipsPageState.membersState.selected.value.length}
      />
    </Form>
  );
}

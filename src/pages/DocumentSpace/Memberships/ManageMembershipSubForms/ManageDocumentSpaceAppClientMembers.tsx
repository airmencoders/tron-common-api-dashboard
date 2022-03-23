import { useEffect, useRef } from 'react';
import Button from '../../../../components/Button/Button';
import ComboBoxCellRenderer, {
  ComboBoxCellRendererProps
} from '../../../../components/ComboBoxCellRenderer/ComboBoxCellRenderer';
import DeleteCellRenderer from '../../../../components/DeleteCellRenderer/DeleteCellRenderer';
import Form from '../../../../components/forms/Form/Form';
import SubmitActions from '../../../../components/forms/SubmitActions/SubmitActions';
import SuccessErrorMessage from '../../../../components/forms/SuccessErrorMessage/SuccessErrorMessage';
import FullPageInfiniteGrid from '../../../../components/Grid/FullPageInifiniteGrid/FullPageInfiniteGrid';
import GridColumn from '../../../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../../../components/Grid/GridUtils/grid-utils';
import Spinner from '../../../../components/Spinner/Spinner';
import RemoveIcon from '../../../../icons/RemoveIcon';
import {
  DocumentSpaceAppClientResponseDto,
  DocumentSpacePrivilegeDtoTypeEnum
} from '../../../../openapi';
import { FormActionType } from '../../../../state/crud-page/form-action-type';
import { useDocumentSpaceMembershipsPageState } from '../../../../state/document-space/document-space-state';
import { getHighestPrivForAppClientMember, resolvePrivName } from '../../../../utils/document-space-utils';
import DocumentSpaceMembershipsDeleteConfirmation from '../DocumentSpaceMembershipsDeleteConfirmation';
import '../DocumentSpaceMemberships.scss';

export interface ManageDocumentAppClientMembersProps {
  documentSpaceId: string;
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
  const pageState = useDocumentSpaceMembershipsPageState();

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return function cleanup() {
      pageState.resetMemberState.bind(pageState);
      mountedRef.current = false;
    };
  }, []);

  function getAppClientMemberUniqueKey(data: DocumentSpaceAppClientResponseDto): string {
    return data.appClientId;
  }

  function renderMembershipColumns(): GridColumn[] {
    return [
      ...membershipColumns,
      new GridColumn({
        valueGetter: GridColumn.defaultValueGetter,
        headerName: 'Permissions',
        cellRenderer: ComboBoxCellRenderer,
        cellRendererParams: {
          items: Object.values(DocumentSpacePrivilegeDtoTypeEnum).map((item) => resolvePrivName(item)),
          onChange: (row: DocumentSpaceAppClientResponseDto, item: string) => pageState.onAppClientMemberPrivilegeDropDownChanged.bind(pageState, row, item)(),
          selectedItem: getHighestPrivForAppClientMember,
        } as ComboBoxCellRendererProps,
      }),
      new GridColumn({
        valueGetter: GridColumn.defaultValueGetter,
        headerName: 'Remove',
        cellRenderer: DeleteCellRenderer,
        cellRendererParams: {
          onClick: (row: DocumentSpaceAppClientResponseDto) => pageState.deleteAppClientMemberRow.bind(pageState, row)(),
        },
      }),
    ];
  }

  return (
    <Form onSubmit={(event) => pageState.saveAppClientMembers.bind(pageState, props.documentSpaceId, event)()} className="edit-members-form">
      <div className="document-space-members">
        <div className="document-space-members__header">
          <h4 className="header__title">Assigned App Clients</h4>
          {
            <div className="header__actions">
              <Button
                disableMobileFullWidth
                type={'button'}
                disabled={pageState.membershipsPageState.appClientMembersState.selected.value.length <= 1}
                onClick={() => pageState.membershipsPageState.appClientMembersState.deletionState.isConfirmationOpen.set(true)}
                unstyled
                transparentOnDisabled
                className={`${
                  pageState.membershipsPageState.appClientMembersState.selected.value.length <= 1
                    ? 'actions__remove-button-hidden'
                    : ''
                }`}
              >
                <RemoveIcon
                  iconTitle="Remove Selected App Client Members"
                  className={`${
                    pageState.membershipsPageState.appClientMembersState.selected.value.length <= 1
                      ? 'actions__remove-button-hidden'
                      : ''
                  }`}
                  disabled={pageState.membershipsPageState.appClientMembersState.selected.value.length <= 1}
                  size={1.5}
                />
                Remove Selected App Clients
              </Button>
            </div>
          }
        </div>
        {(pageState.membershipsPageState.appClientsDatasourceState.datasource.value && (
          <FullPageInfiniteGrid
            columns={renderMembershipColumns()}
            datasource={pageState.membershipsPageState.appClientsDatasourceState.datasource.value}
            cacheBlockSize={generateInfiniteScrollLimit(pageState.infiniteScrollOptions)}
            maxBlocksInCache={pageState.infiniteScrollOptions.maxBlocksInCache}
            maxConcurrentDatasourceRequests={pageState.infiniteScrollOptions.maxConcurrentDatasourceRequests}
            suppressCellSelection
            updateDatasource={pageState.membershipsPageState.appClientsDatasourceState.shouldUpdateDatasource.value}
            updateDatasourceCallback={pageState.onAppClientDatasourceUpdateCallback.bind(pageState)}
            getRowNodeId={getAppClientMemberUniqueKey}
            rowSelection="multiple"
            onRowSelected={pageState.onAppClientMemberSelectionChange.bind(pageState)}
            suppressRowClickSelection
          />
        )) || <Spinner />}
        <SuccessErrorMessage
          errorMessage={pageState.membershipsPageState.appClientMembersState.memberUpdateFailMessage.value}
          showErrorMessage={pageState.membershipsPageState.appClientMembersState.showUpdateFailMessage.value}
          showSuccessMessage={pageState.membershipsPageState.appClientMembersState.showUpdateSuccessMessage.value}
          successMessage={pageState.membershipsPageState.appClientMembersState.memberUpdateSuccessMessage.value}
          showCloseButton={true}
        />
        <SubmitActions
          onCancel={props.onCloseHandler}
          cancelButtonLabel="Close"
          formActionType={FormActionType.UPDATE}
          submitButtonLabel="Save"
          isFormValid={true}
          isFormModified={pageState.membershipsPageState.appClientMembersState.membersToUpdate.length > 0}
          isFormSubmitting={pageState.membershipsPageState.appClientMembersState.submitting.value}
        />
      </div>
      <DocumentSpaceMembershipsDeleteConfirmation
        onMemberDeleteConfirmationSubmit={pageState.onAppClientMemberDeleteConfirmation.bind(pageState, props.documentSpaceId, mountedRef.current)}
        onCancel={() => pageState.membershipsPageState.appClientMembersState.deletionState.isConfirmationOpen.set(false)}
        show={pageState.membershipsPageState.appClientMembersState.deletionState.isConfirmationOpen.value}
        selectedMemberCount={pageState.membershipsPageState.appClientMembersState.selected.value.length}
      />
    </Form>
  );
}

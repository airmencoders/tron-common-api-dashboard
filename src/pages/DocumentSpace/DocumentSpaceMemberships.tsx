import {none, useHookstate} from '@hookstate/core';
import {IDatasource} from 'ag-grid-community';
import React, {useEffect, useRef} from 'react';
import {InfiniteScrollOptions} from '../../components/DataCrudFormPage/infinite-scroll-options';
import GridColumn from '../../components/Grid/GridColumn';
import {generateInfiniteScrollLimit} from '../../components/Grid/GridUtils/grid-utils';
import InfiniteScrollGrid from '../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import Modal from '../../components/Modal/Modal';
import ModalFooterSubmit from '../../components/Modal/ModalFooterSubmit';
import ModalTitle from '../../components/Modal/ModalTitle';
import {DocumentSpaceDashboardMemberResponseDto} from '../../openapi';
import {documentSpaceMembershipService} from '../../state/document-space/document-space-state';
import DocumentSpaceMembershipsForm from './DocumentSpaceMembershipsForm';
import {DocumentSpaceMembershipsProps} from './DocumentSpaceMembershipsProps';
import BatchUserUploadDialog from "./BatchUserUploadDialog";
import SuccessErrorMessage from "../../components/forms/SuccessErrorMessage/SuccessErrorMessage";
import {SuccessErrorMessageProps} from "../../components/forms/SuccessErrorMessage/SuccessErrorMessageProps";
import Button from '../../components/Button/Button';
import RemoveIcon from '../../icons/RemoveIcon';
import {GridSelectionType} from '../../components/Grid/grid-selection-type';
import './DocumentSpaceMemberships.scss';
import {prepareRequestError} from '../../utils/ErrorHandling/error-handling-utils';
import {createTextToast} from '../../components/Toast/ToastUtils/ToastUtils';
import {ToastType} from '../../components/Toast/ToastUtils/toast-type';
import DocumentSpaceMembershipsDeleteConfirmation from './DocumentSpaceMembershipsDeleteConfirmation';

interface DocumentSpaceMembershipsState {
  datasourceState: {
    datasource?: IDatasource,
    shouldUpdateDatasource: boolean
  },
  membersState: {
    selected: DocumentSpaceDashboardMemberResponseDto[],
    deletionState: {
      isConfirmationOpen: boolean
    }
  }
}

export interface BatchUploadState {
  successErrorState: SuccessErrorMessageProps ;
}

const infiniteScrollOptions: InfiniteScrollOptions = {
  enabled: true,
  limit: 100
};

const membershipColumns: GridColumn[] = [
  new GridColumn({
    field: 'email',
    headerName: 'Email',
    resizable: true,
    sortable: true
  })
];

function getDashboardMemberUniqueKey(data: DocumentSpaceDashboardMemberResponseDto): string {
  return data.id;
}

function DocumentSpaceMemberships(props: DocumentSpaceMembershipsProps) {
  const membershipService = documentSpaceMembershipService();
  const batchUploadState = useHookstate<BatchUploadState>({
    successErrorState:{successMessage: 'Successfully added members to Document Space', errorMessage: '', showSuccessMessage: false  , showErrorMessage: false, showCloseButton: true}
  })
  const pageState = useHookstate<DocumentSpaceMembershipsState>({
    datasourceState: {
      datasource: undefined,
      shouldUpdateDatasource: false
    },
    membersState: {
      selected: [],
      deletionState: {
        isConfirmationOpen: false
      }
    }
  });

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return function cleanup() {
      mountedRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!props.isOpen) {
      resetMemberState();
      resetBatchUploadState();
    }
  }, [props.isOpen]);

  useEffect(() => {
    pageState.merge({
      datasourceState: {
        datasource: membershipService.createMembersDatasource(props.documentSpaceId, infiniteScrollOptions),
        shouldUpdateDatasource: true
      },
      membersState: {
        selected: [],
        deletionState: {
          isConfirmationOpen: false
        }
      }
    });
  }, [props.documentSpaceId]);

  function onDatasourceUpdateCallback(): void {
    pageState.datasourceState.merge({
      shouldUpdateDatasource: false
    });
  }

  function onMemberChangeCallback(): void {
    pageState.datasourceState.shouldUpdateDatasource.set(true);
  }

  async function onMemberDeleteConfirmation() {
    try {
      await membershipService.removeDocumentSpaceDashboardMembers(props.documentSpaceId, pageState.membersState.selected.value);

      // Refresh the member list
      // Clean up state
      if (mountedRef.current) {
        onMemberChangeCallback();
        createTextToast(ToastType.SUCCESS, `Deleted (${pageState.membersState.selected.value.length}) Document Space Dashboard Users`);

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
        isConfirmationOpen: false
      }
    });
  }

  function resetBatchUploadState() {
    batchUploadState.successErrorState.merge({
      successMessage: 'Successfully added members to Document Space',
      errorMessage: '',
      showSuccessMessage: false,
      showErrorMessage: false,
      showCloseButton: true
    });
  }

  function onMemberSelectionChange(data: DocumentSpaceDashboardMemberResponseDto, selectionEvent: GridSelectionType): void {
    if (selectionEvent === 'selected') {
      pageState.membersState.selected.merge([data]);
    } else {
      pageState.membersState.selected.find(member => member.value.id === data.id)?.set(none);
    }
  }

  return (
    <Modal
      headerComponent={
        <div style={{display:'flex', alignItems:'center'}}>
          <ModalTitle title="Member Management" />
          <BatchUserUploadDialog
            documentSpaceId={props.documentSpaceId}
            batchUploadState={batchUploadState}
            onFinish={onMemberChangeCallback}
          />
      </div>}
      footerComponent={<ModalFooterSubmit
        hideCancel
        onSubmit={props.onSubmit}
        submitText="Close"
      />}
      show={props.isOpen}
      onHide={props.onSubmit}
      width="50%"
      height="auto"
    >
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
      />
      {pageState.datasourceState.datasource.value &&
        <div className="document-space-members">
          <div className="document-space-members__header">
            <h4 className="header__title">Members</h4>
            <div className="header__actions">
              <Button
                disableMobileFullWidth
                type={'button'}
                disabled={pageState.membersState.selected.value.length === 0}
                onClick={() => pageState.membersState.deletionState.isConfirmationOpen.set(true)}
                unstyled
                transparentOnDisabled
                className="actions__remove-button"
              >
                <RemoveIcon iconTitle="Remove Selected Members" disabled={pageState.membersState.selected.value.length === 0} size={1.5} />
              </Button>
            </div>
          </div>
          <InfiniteScrollGrid
            columns={membershipColumns}
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
        </div>
      }

      <DocumentSpaceMembershipsDeleteConfirmation
        onMemberDeleteConfirmationSubmit={onMemberDeleteConfirmation}
        onCancel={() => pageState.membersState.deletionState.isConfirmationOpen.set(false)}
        show={pageState.membersState.deletionState.isConfirmationOpen.value}
        selectedMemberCount={pageState.membersState.selected.value.length}
      />
    </Modal>
  );
}

export default DocumentSpaceMemberships;

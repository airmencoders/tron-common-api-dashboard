import { useHookstate } from '@hookstate/core';
import { IDatasource } from 'ag-grid-community';
import React, { useEffect } from 'react';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import GridColumn from '../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import InfiniteScrollGrid from '../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import Modal from '../../components/Modal/Modal';
import ModalFooterSubmit from '../../components/Modal/ModalFooterSubmit';
import ModalTitle from '../../components/Modal/ModalTitle';
import { DocumentSpaceDashboardMemberResponseDto } from '../../openapi';
import { documentSpaceMembershipService } from '../../state/document-space/document-space-state';
import DocumentSpaceMembershipsForm from './DocumentSpaceMembershipsForm';
import { DocumentSpaceMembershipsProps } from './DocumentSpaceMembershipsProps';

interface DocumentSpaceMembershipsState {
  datasourceState: {
    datasource?: IDatasource,
    shouldUpdateDatasource: boolean
  }
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
  const pageState = useHookstate<DocumentSpaceMembershipsState>({
    datasourceState: {
      datasource: undefined,
      shouldUpdateDatasource: false
    }
  });

  useEffect(() => {
    pageState.datasourceState.set({
      datasource: membershipService.createMembersDatasource(props.documentSpaceId, infiniteScrollOptions),
      shouldUpdateDatasource: true
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

  return (
    <Modal
      headerComponent={<ModalTitle title="Member Management" />}
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
      <DocumentSpaceMembershipsForm
        documentSpaceId={props.documentSpaceId}
        onMemberChangeCallback={onMemberChangeCallback}
      />
      {pageState.datasourceState.datasource.value &&
        <div className="">
          <h4>Members</h4>
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
          />
        </div>
      }

    </Modal>
  );
}

export default DocumentSpaceMemberships;

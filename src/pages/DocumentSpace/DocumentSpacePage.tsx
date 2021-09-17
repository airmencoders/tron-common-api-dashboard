import { useHookstate } from '@hookstate/core';
import React, { ChangeEvent, useEffect } from 'react';
import Select from '../../components/forms/Select/Select';
import GridColumn from '../../components/Grid/GridColumn';
import InfiniteScrollGrid from '../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import PageFormat from '../../components/PageFormat/PageFormat';
import { DocumentDto } from '../../openapi';
import { useDocumentSpaceState } from '../../state/document-space/document-space-state';
import { CancellableDataRequest } from '../../utils/cancellable-data-request';

const documentDtoColumns: GridColumn[] = [
  new GridColumn({
    field: 'key',
    headerName: 'Name',
    resizable: true
  }),
  new GridColumn({
    field: 'uploadedDate',
    headerName: 'Last Modified',
    resizable: true
  }),
  new GridColumn({
    field: 'uploadedBy',
    headerName: 'Updated By',
    resizable: true
  })
];

function DocumentSpacePage() {
  const pageState = useHookstate({
    selectedSpace: ''
  });
  const documentSpaceService = useDocumentSpaceState();

  useEffect(() => {
    const spacesCancellableRequest = documentSpaceService.fetchAndStoreSpaces();

    return function cleanup() {
      if (spacesCancellableRequest) {
        spacesCancellableRequest.cancelTokenSource.cancel;
      }
    }
  }, []);

  useEffect(() => {
    let filesCancellableRequest: CancellableDataRequest<DocumentDto[]>;

    if (pageState.selectedSpace.value !== '') {
      filesCancellableRequest = documentSpaceService.fetchAndStoreDocuments(pageState.selectedSpace.value);
    }

    return function cleanup() {
      if (filesCancellableRequest) {
        filesCancellableRequest.cancelTokenSource.cancel;
      }
    }
  }, [pageState.selectedSpace.value]);

  function onDocumentSpaceSelectionChange(event: ChangeEvent<HTMLSelectElement>) {
    pageState.selectedSpace.set(event.target.value);
  }

  const documentSpacesLoading = documentSpaceService.documentSpacesState.promised;
  const documentSpaces = documentSpacesLoading ? [] : documentSpaceService.documentSpacesState.value;

  console.log(pageState.selectedSpace.value)

  return (
    <PageFormat pageTitle="Document Spaces">

      <Select id="document-space" name="document-space"
        defaultValue="Select a Space"
        disabled={documentSpacesLoading}
        onChange={onDocumentSpaceSelectionChange}
      >
        {documentSpacesLoading ?
          <option key="document-space-loading" value="Loading...">Loading...</option>
          :
          [{ name: 'Select a Space' }, ...documentSpaceService.documentSpacesState.value].map(item => {
            return <option key={item.name} value={item.name}>{item.name}</option>;
          })
        }
      </Select>

    </PageFormat>
  );
}

export default DocumentSpacePage;
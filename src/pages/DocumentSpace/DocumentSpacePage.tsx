import React, { ChangeEvent, useEffect } from 'react';
import { useHookstate } from '@hookstate/core';
import { InfiniteScrollOptions } from '../../components/DataCrudFormPage/infinite-scroll-options';
import Select from '../../components/forms/Select/Select';
import GridColumn from '../../components/Grid/GridColumn';
import { generateInfiniteScrollLimit } from '../../components/Grid/GridUtils/grid-utils';
import InfiniteScrollGrid from '../../components/Grid/InfiniteScrollGrid/InfiniteScrollGrid';
import PageFormat from '../../components/PageFormat/PageFormat';
import { DocumentSpaceInfoDto } from '../../openapi';
import { useDocumentSpaceState } from '../../state/document-space/document-space-state';
import FormGroup from '../../components/forms/FormGroup/FormGroup';

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

const infiniteScrollOptions: InfiniteScrollOptions = {
  enabled: true,
  limit: 100
};

interface DocumentSpacePageState {
  selectedSpace: string;
}

const selectedSpaceDefaultValue = "Select a Space";

function DocumentSpacePage() {
  const pageState = useHookstate<DocumentSpacePageState>({
    selectedSpace: ''
  });
  const documentSpaceService = useDocumentSpaceState();

  useEffect(() => {
    const spacesCancellableRequest = documentSpaceService.fetchAndStoreSpaces();

    return function cleanup() {
      if (spacesCancellableRequest != null) {
        spacesCancellableRequest.cancelTokenSource.cancel();
      }

      documentSpaceService.resetState();
    }
  }, []);

  function onDocumentSpaceSelectionChange(event: ChangeEvent<HTMLSelectElement>): void {
    pageState.selectedSpace.set(event.target.value);
  }

  function isSelectedSpaceValid(): boolean {
    const selectedSpace = pageState.selectedSpace.value;

    return selectedSpace?.trim() !== '' && selectedSpace !== selectedSpaceDefaultValue;
  }

  function getSpaceValues(): DocumentSpaceInfoDto[] {
    if (isDocumentSpacesLoading) {
      return [{name: 'Loading...'}];
    }

    if (isDocumentSpacesErrored) {
      return [{name: 'Could not load Document Spaces'}]
    }

    if (isSelectedSpaceValid()) {
      return documentSpaceService.documentSpaces;
    }

    return [{ name: selectedSpaceDefaultValue }, ...documentSpaceService.documentSpaces];
  }

  const isDocumentSpacesLoading = documentSpaceService.isDocumentSpacesStatePromised;
  const isDocumentSpacesErrored = documentSpaceService.isDocumentSpacesStateErrored;
  const currentSelectedSpace = pageState.selectedSpace.value;

  return (
    <PageFormat pageTitle="Document Space">

      <FormGroup
        labelName="document-space"
        labelText="Spaces"
        isError={false}
      >
        <Select id="document-space" name="document-space"
          defaultValue={selectedSpaceDefaultValue}
          disabled={isDocumentSpacesLoading || isDocumentSpacesErrored}
          onChange={onDocumentSpaceSelectionChange}
        >
          {
            getSpaceValues().map(item => {
              return <option key={item.name} value={item.name}>{item.name}</option>;
            })
          }
        </Select>
      </FormGroup>

      {isSelectedSpaceValid() &&
        <InfiniteScrollGrid
          columns={documentDtoColumns}
          datasource={documentSpaceService.createDatasource(currentSelectedSpace, infiniteScrollOptions)}
          cacheBlockSize={generateInfiniteScrollLimit(infiniteScrollOptions)}
          maxBlocksInCache={infiniteScrollOptions.maxBlocksInCache}
          maxConcurrentDatasourceRequests={infiniteScrollOptions.maxConcurrentDatasourceRequests}
          suppressCellSelection
        />
      }

    </PageFormat>
  );
}

export default DocumentSpacePage;
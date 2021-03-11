import React from 'react';
import {DataCrudFormPage} from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import {ScratchStorageAppRegistryDto} from '../../openapi/models';
import {useCrudPageState} from '../../state/crud-page/crud-page-state';
import { useScratchStorageState } from '../../state/scratch-storage/scratch-storage-state';
import ScratchStorageEditForm from './ScratchStorageEditForm';

const columns: GridColumn[] =
    [
      new GridColumn('id', true, true, 'id'),
      new GridColumn('appName', true, true, 'App Name')
    ];

function ScratchStoragePage() {
  return (
      <DataCrudFormPage<ScratchStorageAppRegistryDto, ScratchStorageAppRegistryDto>
          columns={columns}
          createForm={ScratchStorageEditForm}
          dataTypeName="Scratch Storage App"
          pageTitle="Scratch Storage Apps"
          updateForm={ScratchStorageEditForm}
          useDataState={useScratchStorageState}
          usePageState={useCrudPageState}
          allowEdit={false}
      />
  );
}

export default ScratchStoragePage;

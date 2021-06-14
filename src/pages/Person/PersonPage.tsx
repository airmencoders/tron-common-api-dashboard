import React from 'react';
import {DataCrudFormPage} from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import PersonEditForm from './PersonEditForm';
import {PersonDto} from '../../openapi/models';
import {usePersonState} from '../../state/person/person-state';
import LoadingCellRenderer from '../../components/LoadingCellRenderer/LoadingCellRenderer';
import { createDefaultGridFilterParamsForType } from '../../components/Grid/GridUtils/grid-utils';

const columns: GridColumn[] =
  [
    new GridColumn({
      field: 'id',
      sortable: true,
      filter: true,
      headerName: 'id',
      cellRenderer: LoadingCellRenderer,
      filterParams: createDefaultGridFilterParamsForType('uuid')
    }),
    new GridColumn({
      field: 'email',
      sortable: true,
      filter: true,
      headerName: 'Email'
    }),
    new GridColumn({
      field: 'firstName',
      sortable: true,
      filter: true,
      headerName: 'First Name'
    }),
    new GridColumn({
      field: 'middleName',
      sortable: true,
      filter: true,
      headerName: 'Middle Name'
    }),
    new GridColumn({
      field: 'lastName',
      sortable: true,
      filter: true,
      headerName: 'Last Name'
    }),
    new GridColumn({
      field: 'title',
      sortable: true,
      filter: true,
      headerName: 'Title'
    }),
    new GridColumn({
      field: 'branch',
      sortable: false,
      filter: true,
      headerName: 'Branch',
      filterParams: createDefaultGridFilterParamsForType('enum')
    }),
    new GridColumn({
      field: 'rank',
      sortable: true,
      filter: true,
      headerName: 'Rank'
    }),
  ];

function PersonPage() {
  return (
    <DataCrudFormPage<PersonDto, PersonDto>
      columns={columns}
      createForm={PersonEditForm}
      dataTypeName="Person"
      pageTitle="People"
      updateForm={PersonEditForm}
      useDataState={usePersonState}
      allowEdit={true}
      allowAdd
      autoResizeColumns
      autoResizeColummnsMinWidth={1200}
      infiniteScrollOptions={{
        enabled: true
      }}
    />
  );
}

export default PersonPage;

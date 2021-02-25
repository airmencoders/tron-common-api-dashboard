import React from 'react';
import {DataCrudFormPage} from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import PersonEditForm from './PersonEditForm';
import {PersonDto} from '../../openapi/models';
import {useCrudPageState} from '../../state/crud-page/crud-page-state';
import {usePersonState} from '../../state/person/person-state';

const columns: GridColumn[] =
    [
      new GridColumn('id', true, true, 'id'),
      new GridColumn('firstName', true, true, 'First Name'),
      new GridColumn('middleName', true, true, 'Middle Name'),
      new GridColumn('lastName', true, true, 'Last Name'),
      new GridColumn('title', true, true, 'Title'),
      new GridColumn('email', true, true, 'Email'),
      new GridColumn('branch', true, true, 'Branch'),
    ];

function PersonPage() {
  return (
      <DataCrudFormPage<PersonDto, PersonDto>
          columns={columns}
          createForm={PersonEditForm}
          dataTypeName="Person"
          pageTitle="Person Management"
          updateForm={PersonEditForm}
          useDataState={usePersonState}
          usePageState={useCrudPageState}
      />
  );
}

export default PersonPage;

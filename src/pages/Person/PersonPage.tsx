import React from 'react';
import {DataCrudFormPage} from '../../components/DataCrudFormPage/DataCrudFormPage';
import GridColumn from '../../components/Grid/GridColumn';
import PersonEditForm from './PersonEditForm';
import {PersonDto} from '../../openapi/models';
import {usePersonState} from '../../state/person/person-state';

const columns: GridColumn[] =
    [
      new GridColumn('id', true, true, 'id'),
      new GridColumn('email', true, true, 'Email'),
      new GridColumn('firstName', true, true, 'First Name'),
      new GridColumn('middleName', true, true, 'Middle Name'),
      new GridColumn('lastName', true, true, 'Last Name'),
      new GridColumn('title', true, true, 'Title'),
      new GridColumn('branch', true, true, 'Branch'),
      new GridColumn('rank', true, true, 'Rank'),
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
      />
  );
}

export default PersonPage;
